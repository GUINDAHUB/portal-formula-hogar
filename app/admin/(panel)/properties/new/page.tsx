import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="hero-surface p-6">
        <h1 className="font-display text-3xl font-bold text-near-black">Nueva propiedad</h1>
        <p className="mt-1 font-body text-gray-600">Completa los datos y sube imagen y dossier en PDF.</p>
      </div>
      <PropertyForm />
    </div>
  );
}
