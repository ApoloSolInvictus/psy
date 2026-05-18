"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Exercise } from "@/lib/exercises";

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function completeExercise(exerciseId: string) {
    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercise_id: exerciseId, notes: notes[exerciseId] ?? "" })
        });

        if (response.ok) {
          setCompleted((current) => ({ ...current, [exerciseId]: true }));
        }
      })();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {exercises.map((exercise) => (
        <Card key={exercise.id} className="bg-white shadow-soft">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Badge variant="secondary">{exercise.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" aria-hidden="true" />
                {exercise.duration_minutes} min
              </span>
            </div>
            <CardTitle>{exercise.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">{exercise.instructions}</p>
            <Textarea
              value={notes[exercise.id] ?? ""}
              onChange={(event) =>
                setNotes((current) => ({ ...current, [exercise.id]: event.target.value }))
              }
              placeholder="Notas opcionales..."
            />
            <Button
              className="w-full"
              variant={completed[exercise.id] ? "calm" : "default"}
              disabled={isPending || completed[exercise.id]}
              onClick={() => completeExercise(exercise.id)}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {completed[exercise.id] ? "Completado" : "Marcar completo"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
