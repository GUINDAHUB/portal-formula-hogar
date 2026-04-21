import { notFound } from "next/navigation";
import { getAdminSupabase } from "@/lib/supabase/admin-data";
import type { PropertyRow } from "@/lib/types";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminConfigMissing } from "@/app/admin/(panel)/AdminConfigMissing";

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const gate = await getAdminSupabase();
  if ("configError" in gate) {
    return <AdminConfigMissing />;
  }
  const { db } = gate;
  const { data, error } = await db.from("properties").select("*").eq("id", params.id).single();

  if (error || !data) {
    notFound();
  }

  const property = data as PropertyRow;

  return (
    <div className="space-y-6">
      <div className="hero-surface p-6">
        <h1 className="font-display text-3xl font-bold text-near-black">Editar propiedad</h1>
        <p className="mt-1 font-body text-gray-600">{property.title}</p>
      </div>
      <PropertyForm property={property} />
    </div>
  );
}
