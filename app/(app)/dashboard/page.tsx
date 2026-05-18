import Link from "next/link";
import { Activity, Bot, CalendarCheck, MessageCircle } from "lucide-react";
import { HelpNowCard } from "@/components/safety/help-now-card";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_CHARACTERS } from "@/lib/characters";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  if (!isSupabaseConfigured()) {
    return {
      profileName: "Explorador",
      conversations: [],
      checkins: [],
      charactersCount: AI_CHARACTERS.length
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profileName: "Explorador",
      conversations: [],
      checkins: [],
      charactersCount: AI_CHARACTERS.length
    };
  }

  const [{ data: profile }, { data: conversations }, { data: checkins }, { count }] =
    await Promise.all([
      supabase.from("profiles").select("name").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("mood_checkins")
        .select("mood, anxiety, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("ai_characters").select("id", { count: "exact", head: true }).eq("active", true)
    ]);

  return {
    profileName: profile?.name ?? user.email ?? "Explorador",
    conversations: conversations ?? [],
    checkins: checkins ?? [],
    charactersCount: count ?? AI_CHARACTERS.length
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="calm">Acompañamiento diario</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ocean">Hola, {data.profileName}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Un espacio para revisar cómo estás, conversar y elegir un paso amable para hoy.
          </p>
        </div>
        <Button asChild>
          <Link href="/chat">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Abrir chat
          </Link>
        </Button>
      </section>

      <SafetyBanner />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-violet" aria-hidden="true" />
              Personajes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-ocean">
            {data.charactersCount}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-5 w-5 text-calm" aria-hidden="true" />
              Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-ocean">
            {data.checkins.length}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-ocean" aria-hidden="true" />
              Conversaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-ocean">
            {data.conversations.length}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle>Historial reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.conversations.length ? (
              data.conversations.map((conversation) => (
                <Link
                  href={`/chat/${conversation.id}`}
                  key={conversation.id}
                  className="block rounded-md border p-3 hover:bg-muted"
                >
                  <p className="font-medium">{conversation.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(conversation.updated_at)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay conversaciones guardadas.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle>Últimos check-ins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.checkins.length ? (
              data.checkins.map((checkin) => (
                <div key={checkin.created_at} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">Ánimo {checkin.mood}/10</p>
                  <p className="text-muted-foreground">
                    Ansiedad {checkin.anxiety}/10 · {formatDate(checkin.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Tu primer check-in espera por ti.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <HelpNowCard />
    </div>
  );
}
