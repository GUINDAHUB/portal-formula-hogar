import { createClient } from "@supabase/supabase-js";

/**
 * Cliente solo con anon key, sin cookies ni sesión.
 * El portal público debe usar esto para que `portal_access` se ejecute
 * igual que para un visitante anónimo (evita interferencia si hay sesión admin en el mismo navegador).
 */
export function createPortalAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
