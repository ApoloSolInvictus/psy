import { CrisisPlanForm } from "@/components/forms/crisis-plan-form";
import { HelpNowCard } from "@/components/safety/help-now-card";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getPlan() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("crisis_plans")
    .select("warning_signs, coping_steps, trusted_contacts, emergency_notes")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export default async function CrisisPlanPage() {
  const plan = await getPlan();

  return (
    <div className="space-y-6">
      <section>
        <Badge variant="violet">Prevención de crisis</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-ocean">Plan de seguridad personal</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ten a mano señales, pasos y contactos que te ayuden a pedir apoyo temprano.
        </p>
      </section>
      <HelpNowCard />
      <SafetyBanner />
      <CrisisPlanForm initialPlan={plan} />
    </div>
  );
}
