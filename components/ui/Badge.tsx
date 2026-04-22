import type { PropertyStatus } from "@/lib/types";

const labels: Record<PropertyStatus, string> = {
  available: "Disponible",
  urgent: "Urgente",
  searching: "En búsqueda de inmueble",
  unavailable: "No disponible",
};

const styles: Record<PropertyStatus, string> = {
  available: "bg-brand text-near-black",
  urgent: "bg-red-700/90 text-red-50",
  searching: "bg-amber-900/85 text-amber-100",
  unavailable: "bg-near-black/85 text-gray-100",
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 font-body text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
