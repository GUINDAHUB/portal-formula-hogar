"use client";

import { useMemo, useState } from "react";
import type { PropertyRow } from "@/lib/types";
import { PropertyCatalogCard } from "@/components/portal/PropertyCatalogCard";

type SortOption = "default" | "priceAsc" | "priceDesc" | "yieldDesc" | "yieldAsc";

function toNumber(value: string | number | null): number | null {
  if (value === null || value === "") return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
}

function compareNumeric(
  a: string | number | null,
  b: string | number | null,
  direction: "asc" | "desc",
): number {
  const aNumber = toNumber(a);
  const bNumber = toNumber(b);

  if (aNumber === null && bNumber === null) return 0;
  if (aNumber === null) return 1;
  if (bNumber === null) return -1;

  return direction === "asc" ? aNumber - bNumber : bNumber - aNumber;
}

export function PropertyCatalogList({ properties }: { properties: PropertyRow[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const sortedProperties = useMemo(() => {
    if (sortBy === "default") return properties;

    const sorted = [...properties];
    sorted.sort((a, b) => {
      if (sortBy === "priceAsc") return compareNumeric(a.purchase_price, b.purchase_price, "asc");
      if (sortBy === "priceDesc") return compareNumeric(a.purchase_price, b.purchase_price, "desc");
      if (sortBy === "yieldAsc") return compareNumeric(a.yield_percent, b.yield_percent, "asc");
      return compareNumeric(a.yield_percent, b.yield_percent, "desc");
    });

    return sorted;
  }, [properties, sortBy]);

  return (
    <section className="space-y-5">
      <div className="hero-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-2xl text-near-black sm:text-3xl">Oportunidades seleccionadas para ti</p>
            <p className="mt-2 max-w-3xl font-body text-sm text-gray-600 sm:text-base">
              Aquí tienes tu selección actual de activos. Mantén este acceso privado y revisa cada dossier para conocer
              detalles, rentabilidad y estructura de inversión.
            </p>
          </div>
          <label className="flex w-full flex-col gap-1 font-body text-xs font-semibold uppercase tracking-[0.08em] text-gray-600 sm:max-w-xs lg:items-end">
            Orden
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="w-full rounded-xl border border-[#dfe5d2] bg-white px-3 py-2.5 text-sm font-semibold text-near-black outline-none transition focus:border-near-black focus:ring-2 focus:ring-brand/35"
              aria-label="Ordenar propiedades por precio o rentabilidad"
            >
              <option value="default">Selección recomendada</option>
              <option value="priceAsc">Precio de compra: menor a mayor</option>
              <option value="priceDesc">Precio de compra: mayor a menor</option>
              <option value="yieldDesc">Rentabilidad: mayor a menor</option>
              <option value="yieldAsc">Rentabilidad: menor a mayor</option>
            </select>
          </label>
        </div>
        <p className="mt-3 font-body text-xs text-gray-600 sm:text-sm">
          Prioriza por precio de compra o por rentabilidad según tu estrategia.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedProperties.map((property, index) => (
          <PropertyCatalogCard key={property.id} property={property} imagePriority={index === 0} />
        ))}
      </div>
    </section>
  );
}
