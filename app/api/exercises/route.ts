import { NextResponse } from "next/server";
import { z } from "zod";
import { EXERCISES } from "@/lib/exercises";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const logSchema = z.object({
  exercise_id: z.string().uuid(),
  notes: z.string().max(2000).optional().nullable()
});

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ exercises: EXERCISES });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("active", true)
    .order("duration_minutes");

  if (error) return NextResponse.json({ error: "No se pudo leer ejercicios." }, { status: 500 });
  return NextResponse.json({ exercises: data });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const parsed = logSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_exercise_logs")
    .insert({
      user_id: user.id,
      exercise_id: parsed.data.exercise_id,
      notes: parsed.data.notes ?? null
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  return NextResponse.json({ log: data });
}
