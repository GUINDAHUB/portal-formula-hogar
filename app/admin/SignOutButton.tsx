"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" className="!rounded-full !py-1.5 !px-3 text-sm" onClick={signOut}>
      Cerrar sesión
    </Button>
  );
}
