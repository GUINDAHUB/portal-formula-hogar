import { notFound } from "next/navigation";
import { getAdminSupabase } from "@/lib/supabase/admin-data";
import type { ClientLinkRow, ClientRow, PropertyRow } from "@/lib/types";
import { ClientForm } from "@/components/admin/ClientForm";
import { LinkGenerator } from "@/components/admin/LinkGenerator";
import { AdminConfigMissing } from "@/app/admin/(panel)/AdminConfigMissing";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const gate = await getAdminSupabase();
  if ("configError" in gate) {
    return <AdminConfigMissing />;
  }
  const { db } = gate;

  const [{ data: client, error: cErr }, { data: props }, { data: linksRaw }] = await Promise.all([
    db.from("clients").select("*").eq("id", params.id).single(),
    db.from("properties").select("id,title").eq("status", "available").order("title", { ascending: true }),
    db.from("client_links").select("*").eq("client_id", params.id).order("created_at", { ascending: false }),
  ]);

  if (cErr || !client) {
    notFound();
  }

  const links = (linksRaw ?? []) as ClientLinkRow[];
  const properties = (props ?? []) as Pick<PropertyRow, "id" | "title">[];

  return (
    <div className="space-y-10">
      <div className="hero-surface p-6">
        <h1 className="font-display text-3xl font-bold text-near-black">{(client as ClientRow).name}</h1>
        <p className="mt-1 font-body text-gray-600">Ficha del cliente y enlaces al portal.</p>
      </div>

      <ClientForm client={client as ClientRow} />

      <LinkGenerator clientId={params.id} properties={properties} links={links} />
    </div>
  );
}
