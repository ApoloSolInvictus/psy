"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button className="mt-3 w-full" variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Salir
    </Button>
  );
}
