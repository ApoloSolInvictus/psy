import { NextResponse } from "next/server";
import { z } from "zod";
import { detectCrisis } from "@/lib/safety";

const moderateSchema = z.object({
  text: z.string().min(1).max(4000)
});

export async function POST(request: Request) {
  const payload = moderateSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ error: "Texto inválido." }, { status: 400 });
  }

  return NextResponse.json(detectCrisis(payload.data.text));
}
