import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { PropertyCatalogList } from "@/components/portal/PropertyCatalogList";
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
      <header className="px-4 pt-5 sm:pt-6">
        <div className="mx-auto max-w-6xl border-b border-[#dfe5d2] pb-4 sm:pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-center sm:justify-start">
              <Logo variant="light" />
            </div>

            <div className="h-px w-full bg-[#e4e9d9] lg:h-10 lg:w-px lg:bg-[#dbe2cc]" aria-hidden />

            <div className="text-center sm:text-left lg:text-right">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-gray-600">
                Portal privado
              </p>
              {clientName ? (
                <p className="mt-1 font-display text-lg font-bold leading-tight text-near-black sm:text-xl">
                  Bienvenido/a, {clientName}
                </p>
              ) : (
                <p className="mt-1 font-display text-lg font-semibold leading-tight text-near-black sm:text-xl">
                  Bienvenido/a
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {properties.length === 0 ? (
          <p className="surface-card p-8 text-center font-body text-gray-600">
            No hay propiedades asignadas a este enlace.
          </p>
        ) : (
          <PropertyCatalogList properties={properties} />
        )}
      </main>
    </div>
  );
}
