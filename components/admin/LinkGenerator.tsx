"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientLink, setLinkActive } from "@/app/admin/clients/actions";
import type { ClientLinkRow, PropertyRow } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const PRESETS: { label: string; hours: number }[] = [
  { label: "24 h", hours: 24 },
  { label: "3 días", hours: 72 },
  { label: "7 días", hours: 168 },
  { label: "15 días", hours: 360 },
  { label: "30 días", hours: 720 },
];

function portalBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || "";
}

export function LinkGenerator({
  clientId,
  properties,
  links,
}: {
  clientId: string;
  properties: Pick<PropertyRow, "id" | "title">[];
  links: ClientLinkRow[];
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [presetHours, setPresetHours] = useState(168);
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const durationHours = useMemo(() => {
    if (useCustom) {
      const d = Number(customDays);
      if (!Number.isFinite(d) || d <= 0) return null;
      return d * 24;
    }
    return presetHours;
  }, [customDays, presetHours, useCustom]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    setMessage("Enlace copiado al portapapeles");
    setTimeout(() => setMessage(null), 2500);
  }

  function onGenerate() {
    setError(null);
    if (!durationHours) {
      setError("Indica una duración válida.");
      return;
    }
    startTransition(async () => {
      const res = await createClientLink({
        clientId,
        durationHours: durationHours,
        propertyIds: selectedIds,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("access_code" in res && res.access_code) {
        setMessage(`Enlace creado: ${res.access_code}`);
        router.refresh();
      }
    });
  }

  async function onToggleActive(linkId: string, next: boolean) {
    setError(null);
    const res = await setLinkActive(linkId, clientId, next);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  const base = portalBaseUrl();

  return (
    <section className="surface-card space-y-6 p-6">
      <div>
        <h2 className="font-display text-xl font-bold text-near-black">Links de acceso</h2>
        <p className="mt-1 font-body text-sm text-gray-600">
          Genera enlaces con código de 6 caracteres. Solo puedes marcar propiedades{" "}
          <span className="font-semibold text-near-black">disponibles</span>; las reservadas y no disponibles del
          catálogo se muestran automáticamente en el portal para todos los enlaces.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="soft-panel px-3 py-2 font-body text-sm text-near-black">
          {message}
        </p>
      ) : null}

      <div className="space-y-3">
        <p className="font-body text-sm font-semibold text-near-black">Duración del enlace</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.hours}
              type="button"
              onClick={() => {
                setUseCustom(false);
                setPresetHours(p.hours);
              }}
              className={`rounded-lg border px-3 py-1.5 font-body text-sm font-semibold transition ${
                !useCustom && presetHours === p.hours
                  ? "border-near-black bg-brand text-near-black"
                  : "border-[#dfe5d2] bg-white text-gray-700 hover:border-near-black/30"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUseCustom(true)}
            className={`rounded-lg border px-3 py-1.5 font-body text-sm font-semibold transition ${
              useCustom ? "border-near-black bg-brand text-near-black" : "border-[#dfe5d2] bg-white text-gray-700"
            }`}
          >
            Personalizado
          </button>
        </div>
        {useCustom ? (
          <label className="flex items-center gap-2 font-body text-sm text-gray-700">
            Días:
            <input
              type="number"
              min={1}
              step={1}
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="admin-input w-28 px-2 py-1.5"
            />
          </label>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="font-body text-sm font-semibold text-near-black">Propiedades disponibles a incluir</p>
        {properties.length === 0 ? (
          <p className="font-body text-sm text-gray-600">No hay propiedades en el sistema todavía.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {properties.map((p) => (
              <li key={p.id} className="flex items-start gap-2">
                <input
                  id={`prop-${p.id}`}
                  type="checkbox"
                  checked={Boolean(selected[p.id])}
                  onChange={() => toggle(p.id)}
                  className="mt-1 h-4 w-4 rounded border-[#d0d8bc] text-near-black focus:ring-brand/50"
                />
                <label htmlFor={`prop-${p.id}`} className="font-body text-sm text-near-black">
                  {p.title}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="button" variant="primary" disabled={pending || properties.length === 0} onClick={onGenerate}>
        {pending ? "Generando…" : "+ Generar nuevo link"}
      </Button>

      <div className="space-y-3">
        <h3 className="font-body text-sm font-semibold text-gray-600">Historial</h3>
        {links.length === 0 ? (
          <p className="font-body text-sm text-gray-600">Aún no hay enlaces.</p>
        ) : (
          <ul className="space-y-3">
            {links.map((l) => {
              const url = base ? `${base}/p/${l.access_code}` : `/p/${l.access_code}`;
              return (
                <li
                  key={l.id}
                  className="soft-panel p-4 font-body text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-base font-bold tracking-widest text-near-black">
                      {l.access_code}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        l.is_active ? "bg-brand text-near-black" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {l.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">
                    Creado: {new Date(l.created_at).toLocaleString("es-ES")} · Caduca:{" "}
                    {new Date(l.expires_at).toLocaleString("es-ES")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" className="!py-2 !px-3 text-xs" onClick={() => copy(url)}>
                      Copiar URL
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="!py-2 !px-3 text-xs"
                      onClick={() => onToggleActive(l.id, !l.is_active)}
                    >
                      {l.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                  <p className="mt-2 break-all text-xs text-gray-500">{url}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
