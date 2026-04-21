import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { PropertyCatalogCard } from "@/components/portal/PropertyCatalogCard";
import { fetchPortalAccess } from "@/lib/portal";

function errorMessage(code: string | null) {
  if (code === "expired") return "Este enlace ha caducado.";
  if (code === "inactive") return "Este enlace está desactivado.";
  return "Este enlace no es válido o ya no está disponible.";
}

export default async function PortalCatalogPage({
  params,
}: {
  params: { code: string };
}) {
  const raw = params.code?.trim() ?? "";
  const accessCode = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const { error, properties, clientName, devDebug } = await fetchPortalAccess(accessCode);

  if (error) {
    return (
      <div className="app-shell px-4 py-16">
        <div className="hero-surface mx-auto max-w-xl p-10 text-center">
          <Logo variant="light" className="justify-center" />
          <p className="mt-8 font-body text-lg text-gray-700">{errorMessage(error)}</p>
          {process.env.NODE_ENV === "development" && devDebug ? (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer font-body text-sm font-semibold text-gray-600">
                Depuración (solo desarrollo)
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-near-black/90 p-4 text-left font-mono text-xs leading-relaxed text-brand">
                {devDebug}
              </pre>
            </details>
          ) : null}
          <Link
            href="/p"
            className="mt-6 inline-flex font-body text-sm font-semibold text-near-black underline underline-offset-4"
          >
            Volver a introducir código
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="border-b border-white/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Logo variant="light" />
          {clientName ? (
            <p className="font-body text-sm text-gray-600 sm:text-right">
              <span className="font-display text-base font-bold text-near-black sm:text-lg">
                Bienvenido/a, {clientName}
              </span>
            </p>
          ) : (
            <p className="font-display text-base font-semibold text-near-black sm:text-lg">Bienvenido/a</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="hero-surface mb-8 p-6 sm:p-8">
          <p className="font-display text-2xl text-near-black sm:text-3xl">Oportunidades seleccionadas para ti</p>
          <p className="mt-2 max-w-3xl font-body text-sm text-gray-600 sm:text-base">
            Aquí tienes tu selección actual de activos. Mantén este acceso privado y revisa cada dossier para conocer
            detalles, rentabilidad y estructura de inversión.
          </p>
        </section>
        {properties.length === 0 ? (
          <p className="surface-card p-8 text-center font-body text-gray-600">
            No hay propiedades asignadas a este enlace.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((p, idx) => (
              <PropertyCatalogCard key={p.id} property={p} imagePriority={idx === 0} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
