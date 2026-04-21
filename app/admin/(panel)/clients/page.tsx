import Link from "next/link";
import { getAdminSupabase } from "@/lib/supabase/admin-data";
import type { ClientRow } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AdminConfigMissing } from "@/app/admin/(panel)/AdminConfigMissing";

export default async function AdminClientsPage() {
  const gate = await getAdminSupabase();
  if ("configError" in gate) {
    return <AdminConfigMissing />;
  }
  const { db } = gate;
  const { data, error } = await db
    .from("clients")
    .select("id,name,company,phone,email,notes,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 p-6 font-body text-red-900">
        No se pudieron cargar los clientes. Revisa la base de datos y el archivo{" "}
        <code className="rounded bg-white px-1">.env</code>. ({error.message})
      </div>
    );
  }

  const rows = (data ?? []) as ClientRow[];

  return (
    <div className="space-y-8">
      <div className="hero-surface flex flex-wrap items-end justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-near-black">Clientes</h1>
          <p className="mt-1 font-body text-gray-600">Gestiona inversores y sus enlaces de acceso.</p>
        </div>
        <Link href="/admin/clients/new">
          <Button type="button" variant="primary">
            Nuevo cliente
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="surface-card p-8 font-body text-gray-600">
          Aún no hay clientes registrados.
        </p>
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="admin-table w-full border-collapse text-left font-body text-sm">
            <thead>
              <tr>
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Empresa</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-semibold text-near-black">{c.name}</td>
                  <td className="p-4 text-gray-700">{c.company ?? "—"}</td>
                  <td className="p-4 text-gray-700">{c.phone ?? "—"}</td>
                  <td className="p-4 text-gray-700">{c.email ?? "—"}</td>
                  <td className="p-4">
                    <Link className="font-semibold text-near-black underline" href={`/admin/clients/${c.id}`}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
