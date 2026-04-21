import { ClientForm } from "@/components/admin/ClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="hero-surface p-6">
        <h1 className="font-display text-3xl font-bold text-near-black">Nuevo cliente</h1>
        <p className="mt-1 font-body text-gray-600">Datos de contacto y notas internas.</p>
      </div>
      <ClientForm />
    </div>
  );
}
