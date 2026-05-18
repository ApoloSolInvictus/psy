import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle>Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 leading-7 text-muted-foreground">
            <p>
              PSY guarda solo lo necesario para operar el MVP: perfil, conversaciones, check-ins,
              ejercicios, plan de crisis y estado de suscripción.
            </p>
            <p>
              No vendemos datos sensibles. Los mensajes se usan para mostrar historial y mejorar la
              continuidad de la conversación dentro de tu cuenta.
            </p>
            <p>
              Evita escribir datos de terceros, documentos oficiales, direcciones exactas o
              información médica innecesaria.
            </p>
            <p>
              TODO producción: política completa, retención configurable, exportación/eliminación de
              datos, DPA y revisión legal.
            </p>
            <Link className="font-medium text-ocean hover:underline" href="/">
              Volver a PSY
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
