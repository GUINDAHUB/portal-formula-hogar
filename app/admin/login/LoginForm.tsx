"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin/properties";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signErr) {
      setError("Credenciales incorrectas o cuenta no disponible.");
      return;
    }
    router.replace(nextPath.startsWith("/") ? nextPath : "/admin/properties");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="hero-surface mx-auto w-full max-w-md space-y-6 p-8"
    >
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-near-black">
          <LockSimple size={28} weight="fill" className="text-near-black" aria-hidden />
          Acceso administración
        </h1>
        <p className="mt-2 font-body text-sm text-gray-600">
          Introduce tu email y contraseña de Supabase Auth.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="block font-body text-sm font-semibold text-near-black">
          Email
        </label>
        <input
          className="admin-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block font-body text-sm font-semibold text-near-black">
          Contraseña
        </label>
        <input
          className="admin-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
