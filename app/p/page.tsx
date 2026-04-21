import { Logo } from "@/components/ui/Logo";
import { AccessCodeForm } from "./AccessCodeForm";

export default function PortalAccessPage() {
  return (
    <div className="min-h-screen bg-near-black px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-10 flex justify-center">
          <Logo variant="dark" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl">Acceso privado a tu catálogo</h1>
          <p className="mt-4 font-body text-base text-white/75 md:text-lg">
            Introduce el código de 6 caracteres que te ha compartido Fórmula Hogar para ver tus oportunidades de
            inversión.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-md">
          <AccessCodeForm />
        </div>
      </div>
    </div>
  );
}
