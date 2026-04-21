import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Solo servidor. Nunca importar en componentes cliente. */
export function hasServiceRoleConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.length &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
  );
}

export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("MISSING_SERVICE_ROLE_ENV");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
