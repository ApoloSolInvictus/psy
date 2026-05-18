import Link from "next/link";
import {
  Bot,
  CalendarCheck,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Chats diarios",
    text: "Conversaciones en español con personajes IA diseñados para escuchar y ordenar emociones.",
    icon: MessageCircle
  },
  {
    title: "Check-in emocional",
    text: "Registro breve de ánimo, ansiedad, sueño, energía y notas para detectar patrones.",
    icon: CalendarCheck
  },
  {
    title: "Plan de prevención",
    text: "Señales, pasos de cuidado, contactos seguros y notas para momentos difíciles.",
    icon: HeartHandshake
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section
        className="relative flex min-h-[86vh] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 48%, rgba(255,255,255,0.48) 100%), url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1800&q=80')"
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-calm/25 bg-white/80 px-3 py-2 text-sm text-ocean shadow-sm">
              <ShieldCheck className="h-4 w-4 text-calm" aria-hidden="true" />
              Acompañamiento emocional, no atención de emergencia
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-normal text-ocean sm:text-6xl">
              PSY
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              Una plataforma de apoyo emocional diario para conversar, crear rutinas saludables y
              practicar ejercicios de regulación en español.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Empezar
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                  Entrar al chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <SafetyBanner />
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-calm" aria-hidden="true" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {feature.text}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
