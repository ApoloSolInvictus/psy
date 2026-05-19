import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  avatar_url: z.string().trim().url().optional().or(z.literal("")).nullable()
});

export async function GET() {
  const auth = await getAuth();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("name, avatar_url, plan, created_at")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo leer el perfil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data, email: auth.user.email });
}

export async function PUT(request: Request) {
  const auth = await getAuth();
  if ("error" in auth) return auth.error;

  const parsed = profileSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de perfil invalidos." },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .upsert(
      {
        user_id: auth.user.id,
        name: parsed.data.name,
        avatar_url: parsed.data.avatar_url || null
      },
      { onConflict: "user_id" }
    )
    .select("name, avatar_url, plan")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar el perfil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}

async function getAuth() {
  if (!isSupabaseConfigured()) {
    return {
      error: NextResponse.json(
        { error: "Supabase no esta configurado." },
        { status: 503 }
      )
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "No autenticado." }, { status: 401 })
    };
  }

  return { supabase, user };
}
