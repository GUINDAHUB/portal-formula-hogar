import Image from "next/image";
import type { PropertyRow } from "@/lib/types";
import { MapPinIcon } from "@/components/portal/MapPinIcon";
import { StatusBadge } from "@/components/ui/Badge";
import { formatEur, formatPercent } from "@/lib/utils/format";

export function PropertyCatalogCard({
  property,
  imagePriority,
}: {
  property: PropertyRow;
  imagePriority?: boolean;
}) {
  const isUnavailable = property.status === "unavailable";
  const isRestricted = isUnavailable;

  return (
    <article className={`surface-card flex flex-col overflow-hidden ${isRestricted ? "opacity-80" : ""}`}>
      <div className="relative aspect-[16/9] w-full bg-[#ecf1dd]">
        {property.image_url ? (
          <Image
            src={property.image_url}
            alt={property.title}
            fill
            className={`object-cover ${isRestricted ? "grayscale brightness-75 saturate-0" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={imagePriority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#dfe7c7] text-sm text-gray-600">
            Sin imagen
          </div>
        )}
        {isRestricted ? (
          <div className="absolute inset-0 bg-near-black/28" aria-hidden />
        ) : null}
        <div className="absolute left-4 top-4">
          <StatusBadge status={property.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h2 className="font-display text-xl font-bold text-near-black">
            {property.title}
          </h2>
          {property.location ? (
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-gray-600">
              <MapPinIcon className="shrink-0 text-near-black" />
              {property.location}
            </p>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-3 font-body text-sm">
          <div className="soft-panel p-3">
            <dt className="text-gray-600">Inversión total</dt>
            <dd className="text-lg font-extrabold text-near-black">
              {formatEur(property.total_investment)}
            </dd>
          </div>
          <div className="soft-panel p-3">
            <dt className="text-gray-600">Precio compra</dt>
            <dd className="text-lg font-bold text-near-black">
              {formatEur(property.purchase_price)}
            </dd>
          </div>
          <div className="soft-panel p-3">
            <dt className="text-gray-600">Duración</dt>
            <dd className="text-lg font-bold text-near-black">
              {property.duration_years != null
                ? `${property.duration_years} años`
                : "—"}
            </dd>
          </div>
          <div className="soft-panel p-3">
            <dt className="text-gray-600">Rentabilidad</dt>
            <dd className="text-lg font-extrabold text-near-black">
              {formatPercent(property.yield_percent)}
            </dd>
          </div>
        </dl>

        {property.description ? (
          <p className="line-clamp-2 font-body text-sm leading-relaxed text-gray-600">
            {property.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-3">
          {!isRestricted && property.pdf_url ? (
            <>
              <a
                href={property.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-btn bg-brand px-6 py-3 text-center font-body text-[15px] font-bold text-near-black shadow-[0_10px_28px_rgba(191,255,0,0.35)] transition hover:brightness-95 hover:shadow-[0_14px_34px_rgba(191,255,0,0.45)]"
              >
                Ver dossier completo
              </a>
              <a
                href={property.pdf_url}
                download
                className="text-center font-body text-sm font-semibold text-gray-600 underline underline-offset-4 hover:text-near-black"
              >
                Descargar PDF
              </a>
            </>
          ) : isRestricted ? (
            <>
              <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-btn border border-gray-300 bg-gray-200 px-6 py-3 text-center font-body text-[15px] font-bold text-gray-500">
                Dossier bloqueado
              </span>
              <span className="text-center text-sm text-gray-500">
                {isUnavailable
                  ? "Esta propiedad no está disponible actualmente."
                  : "Dossier no disponible para este estado."}
              </span>
            </>
          ) : (
            <span className="text-center text-sm text-gray-400">
              Dossier no disponible
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
