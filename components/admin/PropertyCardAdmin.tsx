import Image from "next/image";
import Link from "next/link";
import type { PropertyRow } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { formatEur, formatPercent } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { deletePropertyAction } from "@/app/admin/properties/actions";

export function PropertyCardAdmin({ property }: { property: PropertyRow }) {
  return (
    <div className="surface-card flex flex-col overflow-hidden md:flex-row">
      <div className="relative h-44 w-full shrink-0 bg-[#ecf1dd] md:h-auto md:w-56">
        {property.image_url ? (
          <Image
            src={property.image_url}
            alt={property.title}
            fill
            className="object-cover"
            sizes="224px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Sin foto</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-near-black">{property.title}</h2>
            <p className="font-body text-sm text-gray-600">{property.location ?? "—"}</p>
          </div>
          <StatusBadge status={property.status} />
        </div>
        <div className="flex flex-wrap gap-3 font-body text-sm">
          <span className="soft-panel px-3 py-2">
            <span className="text-gray-600">Inversión: </span>
            <span className="font-bold">{formatEur(property.total_investment)}</span>
          </span>
          <span className="soft-panel px-3 py-2">
            <span className="text-gray-600">Rentabilidad: </span>
            <span className="font-bold">{formatPercent(property.yield_percent)}</span>
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <Link href={`/admin/properties/${property.id}`}>
            <Button type="button" variant="secondary" className="!py-2 !px-4 text-sm">
              Editar
            </Button>
          </Link>
          <form action={deletePropertyAction}>
            <input type="hidden" name="id" value={property.id} />
            <Button type="submit" variant="ghost" className="!py-2 !px-4 text-sm text-red-700">
              Eliminar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
