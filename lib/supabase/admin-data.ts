import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role";

/**
 * Panel admin: comprueba sesión con el cliente con cookies y ejecuta
 * lecturas/escrituras con service role (evita fallos RLS cuando el JWT
 * no llega bien a PostgREST en Server Actions).
 */
export async function getAdminSupabase(): Promise<
  { db: SupabaseClient } | { configError: true }
> {
  const auth = createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }
  if (!hasServiceRoleConfig()) {
    return { configError: true };
  }
  return { db: createServiceRoleClient() };
}

export async function getAdminSupabaseForAction(): Promise<
  { db: SupabaseClient } | { error: string }
> {
  const auth = createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return { error: "No autorizado" };
  }
  if (!hasServiceRoleConfig()) {
    return {
      error:
        "Añade SUPABASE_SERVICE_ROLE_KEY en .env.local (Supabase → Settings → API → service_role, clave secreta). Solo se usa en el servidor tras validar tu sesión.",
    };
  }
  try {
    return { db: createServiceRoleClient() };
  } catch {
    return { error: "No se pudo inicializar el cliente de administración." };
  }
}
