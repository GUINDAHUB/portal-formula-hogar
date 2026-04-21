"use client";

import { Key } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AccessCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (normalized.length !== 6) {
      setError("Introduce un código de 6 caracteres.");
      return;
    }
    router.push(`/p/${normalized}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-950/40 px-3 py-2 font-body text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <label className="flex items-center gap-2 font-body text-sm font-semibold text-white/90">
        <Key size={18} weight="fill" className="text-brand" aria-hidden />
        Código de acceso
      </label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={8}
        autoComplete="one-time-code"
        placeholder="Ej. A1B2C3"
        className="w-full rounded-xl border border-white/20 bg-near-black/80 px-4 py-3 font-mono text-lg font-bold tracking-[0.35em] text-white outline-none transition ring-brand/40 placeholder:text-white/40 focus:border-brand/60 focus:ring-2"
      />
      <Button type="submit" variant="primary" className="w-full">
        Ver catálogo
      </Button>
    </form>
  );
}
