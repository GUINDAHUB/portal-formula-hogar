import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "./SignOutButton";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/admin/properties" className="min-w-0">
          <Logo variant="light" />
        </Link>
        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-[#dce3cb] bg-white px-2 py-1 font-body text-sm font-semibold text-gray-600 shadow-sm">
          <Link
            className="rounded-full px-3 py-1.5 transition hover:bg-[#f3f8e7] hover:text-near-black"
            href="/admin/properties"
          >
            Propiedades
          </Link>
          <Link
            className="rounded-full px-3 py-1.5 transition hover:bg-[#f3f8e7] hover:text-near-black"
            href="/admin/clients"
          >
            Clientes
          </Link>
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
