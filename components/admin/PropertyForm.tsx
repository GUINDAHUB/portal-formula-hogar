"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { saveProperty } from "@/app/admin/properties/actions";
import type { PropertyRow } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const initial = { error: null as string | null };

export function PropertyForm({ property }: { property?: PropertyRow | null }) {
  const [state, formAction] = useFormState(saveProperty, initial);
  const isEdit = Boolean(property?.id);

  return (
    <form action={formAction} className="surface-card space-y-6 p-6">
      {property?.id ? <input type="hidden" name="id" value={property.id} /> : null}

      {state?.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <label className="font-body text-sm font-semibold">Título</label>
          <input
            name="title"
            required
            defaultValue={property?.title ?? ""}
            className="admin-input"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="font-body text-sm font-semibold">Descripción corta</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={property?.description ?? ""}
            className="admin-input"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="font-body text-sm font-semibold">Ubicación</label>
          <input
            name="location"
            defaultValue={property?.location ?? ""}
            className="admin-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Inversión total (€)</label>
          <input
            name="total_investment"
            type="number"
            step="0.01"
            defaultValue={property?.total_investment ?? ""}
            className="admin-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Precio de compra (€)</label>
          <input
            name="purchase_price"
            type="number"
            step="0.01"
            defaultValue={property?.purchase_price ?? ""}
            className="admin-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Duración (años)</label>
          <input
            name="duration_years"
            type="number"
            step="1"
            defaultValue={property?.duration_years ?? ""}
            className="admin-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Rentabilidad (%)</label>
          <input
            name="yield_percent"
            type="number"
            step="0.01"
            defaultValue={property?.yield_percent ?? ""}
            className="admin-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Estado</label>
          <select
            name="status"
            defaultValue={property?.status ?? "available"}
            className="admin-input"
          >
            <option value="available">Disponible</option>
            <option value="urgent">Urgente</option>
            <option value="searching">En búsqueda de inmueble</option>
            <option value="unavailable">No disponible</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="font-body text-sm font-semibold">Foto principal</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full font-body text-sm"
          />
          {property?.image_url ? (
            <p className="text-sm text-gray-600">Imagen actual guardada. Sube otra para reemplazarla.</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="font-body text-sm font-semibold">PDF del dossier</label>
          <input name="pdf" type="file" accept="application/pdf" className="w-full font-body text-sm" />
          {property?.pdf_url ? (
            <p className="text-sm text-gray-600">
              PDF actual:{" "}
              <a className="font-semibold text-near-black underline" href={property.pdf_url} target="_blank" rel="noreferrer">
                ver
              </a>
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary">
          {isEdit ? "Guardar cambios" : "Crear propiedad"}
        </Button>
        <Link
          href="/admin/properties"
          className="inline-flex items-center justify-center rounded-btn border-2 border-near-black bg-transparent px-6 py-3 font-body text-[15px] font-semibold text-near-black transition hover:bg-near-black/5"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
