"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CheckinForm() {
  const [mood, setMood] = useState(6);
  const [anxiety, setAnxiety] = useState(4);
  const [sleep, setSleep] = useState(6);
  const [energy, setEnergy] = useState(5);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mood,
            anxiety,
            sleep_quality: sleep,
            energy,
            notes
          })
        });

        const payload = await response.json();
        setMessage(response.ok ? "Check-in guardado." : payload.error ?? "No se pudo guardar.");
      })();
    });
  }

  return (
    <Card className="bg-white shadow-soft">
      <CardHeader>
        <CardTitle>Check-in emocional</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <RangeField label="Ánimo" value={mood} onChange={setMood} />
          <RangeField label="Ansiedad" value={anxiety} onChange={setAnxiety} />
          <RangeField label="Sueño" value={sleep} onChange={setSleep} />
          <RangeField label="Energía" value={energy} onChange={setEnergy} />
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Algo que quieras recordar de hoy..."
            />
          </div>
          {message ? <p className="rounded-md bg-muted p-3 text-sm">{message}</p> : null}
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RangeField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">{value}/10</span>
      </div>
      <Input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
