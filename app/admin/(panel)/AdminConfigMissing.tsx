export function AdminConfigMissing() {
  return (
    <div className="surface-card border-amber-200 bg-amber-50 p-6 font-body text-amber-950">
      <p className="font-semibold">Falta la clave de servicio de Supabase</p>
      <p className="mt-2 text-sm leading-relaxed">
        Añade <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
        <code className="rounded bg-white px-1">.env.local</code> (solo servidor). La encuentras en Supabase →{" "}
        <strong>Project Settings → API → service_role</strong> (clave <em>secreta</em>, no la publiques ni uses{" "}
        <code className="rounded bg-white px-1">NEXT_PUBLIC_</code>).
      </p>
      <p className="mt-2 text-sm text-amber-900/90">
        El panel la usa únicamente en el servidor después de comprobar que has iniciado sesión.
      </p>
    </div>
  );
}
