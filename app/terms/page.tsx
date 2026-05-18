import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle>Términos y seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 leading-7 text-muted-foreground">
            <p>
              PSY es una herramienta de acompañamiento y educación emocional. No reemplaza
              psicólogos, psiquiatras, médicos, servicios de emergencia ni tratamiento profesional.
            </p>
            <p>
              La IA no diagnostica, no receta, no modifica medicación y no recomienda abandonar
              tratamiento.
            </p>
            <p>
              Si existe riesgo inmediato, ideación suicida, autolesión, daño a terceros, abuso,
              emergencia médica o pérdida de control, contacta emergencias locales o a una persona
              de confianza.
            </p>
            <p>TODO producción: términos legales completos, edad mínima y consentimiento.</p>
            <Link className="font-medium text-ocean hover:underline" href="/">
              Volver a PSY
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
