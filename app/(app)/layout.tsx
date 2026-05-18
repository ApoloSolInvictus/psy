import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SetupNotice } from "@/components/safety/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <AppShell>
        <div className="mb-6">
          <SetupNotice />
        </div>
        {children}
      </AppShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, plan")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <AppShell userEmail={user.email} plan={profile?.plan ? `Plan ${profile.plan}` : "Plan free"}>
      {children}
    </AppShell>
  );
}
