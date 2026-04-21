"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { saveClient } from "@/app/admin/clients/actions";
import type { ClientRow } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const initial = { error: null as string | null };

export function ClientForm({ client }: { client?: ClientRow | null }) {
  const [state, formAction] = useFormState(saveClient, initial);
  const isEdit = Boolean(client?.id);

  return (
    <form action={formAction} className="surface-card space-y-6 p-6">
      {client?.id ? <input type="hidden" name="id" value={client.id} /> : null}

      {state?.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <label className="font-body text-sm font-semibold">Nombre</label>
          <input
            name="name"
            required
            defaultValue={client?.name ?? ""}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Empresa</label>
          <input
            name="company"
            defaultValue={client?.company ?? ""}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <label className="font-body text-sm font-semibold">Teléfono</label>
          <input
            name="phone"
            defaultValue={client?.phone ?? ""}
            className="admin-input"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="font-body text-sm font-semibold">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className="admin-input"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="font-body text-sm font-semibold">Notas</label>
          <textarea
            name="notes"
            rows={5}
            defaultValue={client?.notes ?? ""}
            className="admin-input"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary">
          {isEdit ? "Guardar cliente" : "Crear cliente"}
        </Button>
        <Link
          href="/admin/clients"
          className="inline-flex items-center justify-center rounded-btn border-2 border-near-black bg-transparent px-6 py-3 font-body text-[15px] font-semibold text-near-black transition hover:bg-near-black/5"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
