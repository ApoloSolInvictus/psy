"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CrisisPlanFormProps = {
  initialPlan?: {
    warning_signs?: string[] | null;
    coping_steps?: string[] | null;
    trusted_contacts?: string[] | null;
    emergency_notes?: string | null;
  } | null;
};

export function CrisisPlanForm({ initialPlan }: CrisisPlanFormProps) {
  const [warningSigns, setWarningSigns] = useState((initialPlan?.warning_signs ?? []).join("\n"));
  const [copingSteps, setCopingSteps] = useState((initialPlan?.coping_steps ?? []).join("\n"));
  const [trustedContacts, setTrustedContacts] = useState(
    (initialPlan?.trusted_contacts ?? []).join("\n")
  );
  const [emergencyNotes, setEmergencyNotes] = useState(initialPlan?.emergency_notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/crisis-plan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            warning_signs: splitLines(warningSigns),
            coping_steps: splitLines(copingSteps),
            trusted_contacts: splitLines(trustedContacts),
            emergency_notes: emergencyNotes
          })
        });

        const payload = await response.json();
        setMessage(response.ok ? "Plan guardado." : payload.error ?? "No se pudo guardar.");
      })();
    });
  }

  return (
    <Card className="bg-white shadow-soft">
      <CardHeader>
        <CardTitle>Plan personalizado</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field
            label="Señales de alerta"
            value={warningSigns}
            onChange={setWarningSigns}
            placeholder="Ej. dejo de dormir, me aíslo, pienso en desaparecer..."
          />
          <Field
            label="Pasos de cuidado"
            value={copingSteps}
            onChange={setCopingSteps}
            placeholder="Ej. respirar 4-6, salir de la habitación, llamar a..."
          />
          <Field
            label="Contactos de confianza"
            value={trustedContacts}
            onChange={setTrustedContacts}
            placeholder="Nombre y forma de contacto..."
          />
          <Field
            label="Notas de emergencia"
            value={emergencyNotes}
            onChange={setEmergencyNotes}
            placeholder="Información que quieras tener visible en momentos difíciles..."
          />
          {message ? <p className="rounded-md bg-muted p-3 text-sm">{message}</p> : null}
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Guardar plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
