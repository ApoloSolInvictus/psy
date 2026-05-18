import { CreditCard, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getProfile() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("name, avatar_url, plan").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  return { user, profile, subscription };
}

export default async function BillingPage() {
  const data = await getProfile();
  const plan = data?.subscription?.plan ?? data?.profile?.plan ?? "free";
  const status = data?.subscription?.status ?? "sin suscripción activa";

  return (
    <div className="space-y-6">
      <section>
        <Badge variant="calm">Perfil y suscripción</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-ocean">Tu cuenta</h1>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-calm" aria-hidden="true" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Nombre:</span> {data?.profile?.name ?? "Sin nombre"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {data?.user?.email ?? "Sin configurar"}
            </p>
            <p className="text-muted-foreground">
              TODO producción: edición de perfil, avatar en Supabase Storage y eliminación de
              cuenta.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet" aria-hidden="true" />
              Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <span className="font-medium">Plan:</span> {plan}
            </p>
            <p>
              <span className="font-medium">Estado:</span> {status}
            </p>
            <Button disabled className="w-full">
              PayPal en segunda pasada
            </Button>
            <p className="text-muted-foreground">
              El MVP deja listos los endpoints de PayPal como stubs para integrar Checkout y
              Subscriptions después.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
