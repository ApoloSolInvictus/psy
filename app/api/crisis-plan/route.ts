import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const crisisPlanSchema = z.object({
  warning_signs: z.array(z.string().min(1)).max(20),
  coping_steps: z.array(z.string().min(1)).max(20),
  trusted_contacts: z.array(z.string().min(1)).max(20),
  emergency_notes: z.string().max(3000).optional().nullable()
});

export async function GET() {
  const auth = await getAuth();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("crisis_plans")
    .select("*")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "No se pudo leer el plan." }, { status: 500 });
  return NextResponse.json({ plan: data });
}

export async function PUT(request: Request) {
  const auth = await getAuth();
  if ("error" in auth) return auth.error;

  const parsed = crisisPlanSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("crisis_plans")
    .upsert(
      {
        user_id: auth.userId,
        ...parsed.data,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "No se pudo guardar el plan." }, { status: 500 });
  return NextResponse.json({ plan: data });
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
