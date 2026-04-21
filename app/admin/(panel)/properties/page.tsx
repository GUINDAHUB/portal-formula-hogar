import Link from "next/link";
import { getAdminSupabase } from "@/lib/supabase/admin-data";
import type { PropertyRow } from "@/lib/types";
import { PropertyCardAdmin } from "@/components/admin/PropertyCardAdmin";
import { Button } from "@/components/ui/Button";
import { AdminConfigMissing } from "@/app/admin/(panel)/AdminConfigMissing";

export default async function AdminPropertiesPage() {
  const gate = await getAdminSupabase();
  if ("configError" in gate) {
    return <AdminConfigMissing />;
  }
  const { db } = gate;
  const { data, error } = await db
    .from("properties")
    .select(
      "id,title,description,location,total_investment,purchase_price,duration_years,yield_percent,status,image_url,pdf_url,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 p-6 font-body text-red-900">
        No se pudieron cargar las propiedades. ¿Has aplicado la migración SQL y configurado{" "}
        <code className="rounded bg-white px-1">.env</code>? ({error.message})
      </div>
    );
  }

  const rows = (data ?? []) as PropertyRow[];
  const available = rows.filter((p) => p.status === "available");
  const other = rows.filter((p) => p.status !== "available");

  return (
    <div className="space-y-8">
      <div className="hero-surface flex flex-wrap items-end justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-near-black">Propiedades</h1>
          <p className="mt-1 font-body text-gray-600">
            Gestiona el catálogo. Solo las disponibles se pueden asignar al crear enlaces; reservadas y no disponibles
            se muestran en el portal para todos los clientes.
          </p>
        </div>
        <Link href="/admin/properties/new">
          <Button type="button" variant="primary">
            Nueva propiedad
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="surface-card p-8 font-body text-gray-600">
          Aún no hay propiedades. Crea la primera.
        </p>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-near-black">Disponibles</h2>
              <p className="mt-1 font-body text-sm text-gray-600">
                Aparecen en los enlaces cuando las seleccionas al generar el acceso.
              </p>
            </div>
            {available.length === 0 ? (
              <p className="surface-card p-6 font-body text-sm text-gray-600">
                No hay propiedades disponibles.
              </p>
            ) : (
              <div className="grid gap-6">
                {available.map((p) => (
                  <PropertyCardAdmin key={p.id} property={p} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-near-black">Reservadas y no disponibles</h2>
              <p className="mt-1 font-body text-sm text-gray-600">
                Visibles en el portal para todos los enlaces (no hace falta asignarlas por cliente).
              </p>
            </div>
            {other.length === 0 ? (
              <p className="surface-card p-6 font-body text-sm text-gray-600">
                No hay propiedades en estos estados.
              </p>
            ) : (
              <div className="grid gap-6">
                {other.map((p) => (
                  <PropertyCardAdmin key={p.id} property={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
