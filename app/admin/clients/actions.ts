"use server";

import { getAdminSupabaseForAction } from "@/lib/supabase/admin-data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateAccessCode } from "@/lib/utils/generateCode";

export async function saveClient(_prev: unknown, formData: FormData) {
  const gate = await getAdminSupabaseForAction();
  if ("error" in gate) {
    return { error: gate.error };
  }
  const { db } = gate;

  const id = (formData.get("id") as string | null)?.trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio" };

  const company = String(formData.get("company") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const row = { name, company, phone, email, notes };

  if (id) {
    const { error } = await db.from("clients").update(row).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${id}`);
    redirect(`/admin/clients/${id}`);
  }

  const { data: inserted, error: insErr } = await db
    .from("clients")
    .insert(row)
    .select("id")
    .single();
  if (insErr) return { error: insErr.message };

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${inserted!.id}`);
}

export async function createClientLink(input: {
  clientId: string;
  durationHours: number;
  propertyIds: string[];
}) {
  const gate = await getAdminSupabaseForAction();
  if ("error" in gate) {
    return { error: gate.error };
  }
  const { db } = gate;

  const { clientId, durationHours, propertyIds } = input;
  if (!propertyIds.length) {
    return { error: "Selecciona al menos una propiedad disponible" };
  }

  const { data: availableRows, error: availErr } = await db
    .from("properties")
    .select("id")
    .in("id", propertyIds)
    .in("status", ["urgent", "available", "searching"]);
  if (availErr) return { error: availErr.message };
  const okIds = new Set((availableRows ?? []).map((r) => r.id as string));
  if (okIds.size !== propertyIds.length) {
    return { error: "Solo se pueden incluir propiedades en estado urgente, disponible o en búsqueda" };
  }

  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const access_code = generateAccessCode();
    const { data: link, error: insErr } = await db
      .from("client_links")
      .insert({
        client_id: clientId,
        access_code,
        expires_at: expiresAt,
        is_active: true,
      })
      .select("id")
      .single();

    if (insErr) {
      if (insErr.code === "23505") continue;
      return { error: insErr.message };
    }

    const linkId = link!.id as string;
    const rows = propertyIds.map((property_id) => ({
      client_link_id: linkId,
      property_id,
    }));
    const { error: mErr } = await db.from("client_link_properties").insert(rows);
    if (mErr) return { error: mErr.message };

    revalidatePath(`/admin/clients/${clientId}`);
    return { ok: true as const, access_code };
  }

  return { error: "No se pudo generar un código único" };
}

export async function setLinkActive(linkId: string, clientId: string, is_active: boolean) {
  const gate = await getAdminSupabaseForAction();
  if ("error" in gate) {
    return { error: gate.error };
  }
  const { db } = gate;

  const { error } = await db.from("client_links").update({ is_active }).eq("id", linkId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true as const };
}
