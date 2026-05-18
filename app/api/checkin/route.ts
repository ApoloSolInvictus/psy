import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const checkinSchema = z.object({
  mood: z.number().int().min(1).max(10),
  anxiety: z.number().int().min(1).max(10),
  sleep_quality: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  notes: z.string().max(2000).optional().nullable()
});

export async function GET() {
  const auth = await getAuth();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("mood_checkins")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: "No se pudo leer check-ins." }, { status: 500 });
  return NextResponse.json({ checkins: data });
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if ("error" in auth) return auth.error;

  const parsed = checkinSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("mood_checkins")
    .insert({ ...parsed.data, user_id: auth.userId })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  return NextResponse.json({ checkin: data });
}

async function getAuth() {
  if (!isSupabaseConfigured()) {
    return { error: NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 }) };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  }

  return { supabase, userId: user.id };
}
