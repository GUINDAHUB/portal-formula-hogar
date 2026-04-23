import { createPortalAnonClient } from "@/lib/supabase/portal-anon";
import { createServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role";
import type { PortalAccessFetchResult, PortalAccessResult, PropertyRow } from "@/lib/types";
import { unstable_noStore as noStore } from "next/cache";

/** Nombre de la RPC en Postgres (tu proyecto usa esta; la migración del repo llamaba `portal_access`). */
const PORTAL_RPC = "get_portal_by_code";

const PROPERTY_COLUMNS =
  "id,title,description,location,total_investment,purchase_price,duration_years,yield_percent,status,image_url,pdf_url,created_at,updated_at" as const;

function asPropertyRows(raw: unknown): PropertyRow[] {
  if (raw == null) return [];
  let arr: unknown[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else {
    arr = Array.isArray(raw) ? raw : [];
  }
  const fallbackTs = new Date().toISOString();
  return arr.map((item) => {
    const p = item as Record<string, unknown>;
    return {
      id: String(p.id ?? ""),
      title: String(p.title ?? ""),
      description: (p.description as string | null) ?? null,
      location: (p.location as string | null) ?? null,
      total_investment: (p.total_investment as string | number | null) ?? null,
      purchase_price: (p.purchase_price as string | number | null) ?? null,
      duration_years:
        p.duration_years === null || p.duration_years === undefined
          ? null
          : Number(p.duration_years),
      yield_percent: (p.yield_percent as string | number | null) ?? null,
      status: (p.status as PropertyRow["status"]) ?? "available",
      image_url: (p.image_url as string | null) ?? null,
      pdf_url: (p.pdf_url as string | null) ?? null,
      created_at: String(p.created_at ?? fallbackTs),
      updated_at: String(p.updated_at ?? fallbackTs),
    };
  });
}

function parseJsonbPayload(data: unknown): Record<string, unknown> | null {
  if (data == null) return null;
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (typeof data === "string") {
    try {
      const o = JSON.parse(data) as unknown;
      if (typeof o === "object" && o !== null && !Array.isArray(o)) {
        return o as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function mapStatusToError(status: string): PortalAccessResult["error"] {
  switch (status) {
    case "ok":
      return null;
    case "not_found":
      return "invalid";
    case "inactive":
      return "inactive";
    case "expired":
      return "expired";
    default:
      return "invalid";
  }
}

function isDev() {
  return process.env.NODE_ENV === "development";
}

function parseClientNameField(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length ? t : null;
  }
  return null;
}

/** Nombre del cliente: RPC `client_name` o, si falta, consulta con service_role por código de acceso. */
async function resolveClientNameForPortal(
  payload: Record<string, unknown>,
  accessCode: string,
): Promise<string | null> {
  const fromRpc = parseClientNameField(payload.client_name);
  if (fromRpc) return fromRpc;
  if (!hasServiceRoleConfig()) return null;
  try {
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("client_links")
      .select("clients(name)")
      .eq("access_code", accessCode)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as { clients?: { name?: string | null } | null };
    return parseClientNameField(row.clients?.name ?? null);
  } catch {
    return null;
  }
}

/** Mismo criterio que la RPC: urgentes > disponibles > en búsqueda > no disponibles. */
function sortCatalogProperties(rows: PropertyRow[]): PropertyRow[] {
  const rank = (s: PropertyRow["status"]) => {
    if (s === "urgent") return 0;
    if (s === "available") return 1;
    if (s === "searching") return 2;
    return 3;
  };
  return [...rows].sort((a, b) => {
    const d = rank(a.status) - rank(b.status);
    if (d !== 0) return d;
    const aYield = Number(a.yield_percent);
    const bYield = Number(b.yield_percent);
    const aHasYield = Number.isFinite(aYield);
    const bHasYield = Number.isFinite(bYield);
    if (aHasYield && bHasYield && aYield !== bYield) return bYield - aYield;
    if (aHasYield !== bHasYield) return aHasYield ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * La RPC puede no incluir no disponibles si RLS filtra subconsultas en Supabase.
 * En el servidor completamos el catálogo global con service_role (sin exponer la clave al cliente).
 */
async function mergeWithGlobalUnavailable(fromRpc: PropertyRow[]): Promise<PropertyRow[]> {
  if (!hasServiceRoleConfig()) {
    if (isDev()) {
      console.warn(
        "[portal] SUPABASE_SERVICE_ROLE_KEY no configurada: el catálogo puede no mostrar no disponibles si la RPC no las devuelve.",
      );
    }
    return sortCatalogProperties(fromRpc);
  }

  try {
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("properties")
      .select(PROPERTY_COLUMNS)
      .eq("status", "unavailable");

    if (error) {
      if (isDev()) console.error("[portal] merge catálogo global:", error.message);
      return sortCatalogProperties(fromRpc);
    }

    const globalOther = asPropertyRows(data ?? []);
    const byId = new Map<string, PropertyRow>();
    for (const p of fromRpc) {
      if (p.id) byId.set(p.id, p);
    }
    for (const p of globalOther) {
      if (p.id && !byId.has(p.id)) byId.set(p.id, p);
    }
    return sortCatalogProperties(Array.from(byId.values()));
  } catch (e) {
    if (isDev()) console.error("[portal] merge catálogo global:", e);
    return sortCatalogProperties(fromRpc);
  }
}

export async function fetchPortalAccess(code: string): Promise<PortalAccessFetchResult> {
  noStore();
  const supabase = createPortalAnonClient();
  const { data, error: rpcError } = await supabase.rpc(PORTAL_RPC, {
    p_code: code,
  });

  if (rpcError) {
    const devDebug = isDev()
      ? [
          `Fallo al llamar a la RPC \`${PORTAL_RPC}\` (PostgREST / Supabase API).`,
          "",
          `Mensaje: ${rpcError.message}`,
          `Código: ${rpcError.code ?? "—"}`,
          `Detalles: ${rpcError.details ?? "—"}`,
          `Hint: ${rpcError.hint ?? "—"}`,
          "",
          "Comprueba en Supabase → SQL Editor:",
          `  SELECT public.${PORTAL_RPC}('TUCODIGO');`,
          "",
          "Y permisos:",
          `  GRANT EXECUTE ON FUNCTION public.${PORTAL_RPC}(text) TO anon;`,
        ].join("\n")
      : undefined;
    if (isDev()) {
      console.error(`[${PORTAL_RPC} RPC]`, rpcError);
    }
    return { error: "invalid", properties: [], clientName: null, devDebug };
  }

  const o = parseJsonbPayload(data);
  if (!o) {
    const devDebug = isDev()
      ? [
          "La RPC respondió pero no pudimos interpretar el JSON.",
          "",
          `Tipo de data: ${typeof data}`,
          `Vista previa: ${JSON.stringify(data)?.slice(0, 400)}`,
        ].join("\n")
      : undefined;
    return { error: "invalid", properties: [], clientName: null, devDebug };
  }

  const status = String(o.status ?? "");

  if (status === "ok") {
    const fromRpc = asPropertyRows(o.properties);
    const properties = await mergeWithGlobalUnavailable(fromRpc);
    const clientName = await resolveClientNameForPortal(o, code);
    return {
      error: null,
      properties,
      clientName,
    };
  }

  const error = mapStatusToError(status);
  const result: PortalAccessFetchResult = {
    error,
    properties: [],
    clientName: null,
  };

  if (isDev()) {
    result.devDebug = [
      "La función SQL respondió sin error HTTP; el enlace no es válido o el estado no es `ok`.",
      "",
      `Código enviado: "${code}"`,
      `status devuelto: "${status}"`,
      "",
      "Valores esperados por `get_portal_by_code`: ok | not_found | inactive | expired",
      "",
      "SQL útil:",
      "  SELECT id, access_code, is_active, expires_at FROM public.client_links;",
    ].join("\n");
  }

  return result;
}
