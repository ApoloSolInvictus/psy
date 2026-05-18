import { Phone, ShieldAlert, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HelpNowCard() {
  return (
    <Card id="ayuda-ahora" className="border-destructive/25 bg-white shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          Necesito ayuda ahora
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="flex gap-3">
          <Phone className="mt-1 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm">
            Si hay peligro inmediato, llama a emergencias locales. En EE. UU. llama al 911 o al
            988 para crisis suicida o emocional.
          </p>
        </div>
        <div className="flex gap-3">
          <Users className="mt-1 h-5 w-5 shrink-0 text-calm" aria-hidden="true" />
          <p className="text-sm">
            Contacta a una persona de confianza y evita quedarte a solas si sientes riesgo de
            hacerte daño o dañar a alguien.
          </p>
        </div>
        <div className="flex gap-3">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-violet" aria-hidden="true" />
          <p className="text-sm">
            PSY puede acompañarte, pero en crisis la prioridad es apoyo humano y servicios de
            emergencia.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
