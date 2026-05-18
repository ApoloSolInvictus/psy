import { ExerciseList } from "@/components/forms/exercise-list";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { Badge } from "@/components/ui/badge";
import { EXERCISES, type Exercise } from "@/lib/exercises";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getExercises(): Promise<Exercise[]> {
  if (!isSupabaseConfigured()) return EXERCISES;

  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("id, title, category, duration_minutes, instructions, active")
    .eq("active", true)
    .order("duration_minutes");

  return data?.length ? data : EXERCISES;
}

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-6">
      <section>
        <Badge variant="calm">Rutinas saludables</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-ocean">Ejercicios diarios</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Acciones breves para regular, conectar y recuperar claridad.
        </p>
      </section>
      <SafetyBanner />
      <ExerciseList exercises={exercises} />
    </div>
  );
}
