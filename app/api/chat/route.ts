import { NextResponse } from "next/server";
import { z } from "zod";
import { AI_CHARACTERS, getFallbackCharacter } from "@/lib/characters";
import { getOpenAIConfig, isSupabaseConfigured } from "@/lib/env";
import { BASE_SYSTEM_PROMPT } from "@/lib/prompts";
import { crisisResponse, detectCrisis } from "@/lib/safety";
import { createClient } from "@/lib/supabase/server";
import { titleFromMessage } from "@/lib/utils";

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  characterId: z.string().uuid(),
  conversationId: z.string().uuid().optional().nullable()
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const safety = detectCrisis(parsed.data.message);
  const character = await getCharacter(parsed.data.characterId);
  const { apiKey, model } = getOpenAIConfig();

  if (!safety.isCrisis && !apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY no está configurada." }, { status: 503 });
  }

  let conversationId: string;

  try {
    conversationId = await resolveConversation({
      requestedConversationId: parsed.data.conversationId,
      characterId: character.id,
      userId: user.id,
      firstMessage: parsed.data.message
    });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la conversación." }, { status: 500 });
  }

  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "user",
      content: parsed.data.message,
      safety_flag: safety.flag
    })
    .select("id")
    .single();

  if (userMessageError) {
    return NextResponse.json({ error: "No se pudo guardar el mensaje." }, { status: 500 });
  }

  if (safety.isCrisis) {
    const message = crisisResponse(safety.flag);
    const { data: assistantMessage } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: message,
        safety_flag: safety.flag
      })
      .select("id")
      .single();

    await touchConversation(conversationId);

    return NextResponse.json({
      conversationId,
      userMessageId: userMessage.id,
      messageId: assistantMessage?.id,
      message,
      safetyFlag: safety.flag,
      crisis: true
    });
  }

  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: false })
    .limit(12);

  const input = (history ?? [])
    .reverse()
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content
    }));

  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions: `${BASE_SYSTEM_PROMPT}\n\nEstilo del personaje ${character.name}: ${character.system_prompt}`,
      input,
      max_output_tokens: 600
    })
  });

  if (!aiResponse.ok) {
    return NextResponse.json(
      { error: "No se pudo generar respuesta de IA." },
      { status: aiResponse.status }
    );
  }

  const aiPayload = await aiResponse.json();
  const message = extractOutputText(aiPayload);

  const { data: assistantMessage, error: assistantError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: message,
      safety_flag: "none"
    })
    .select("id")
    .single();

  if (assistantError) {
    return NextResponse.json({ error: "No se pudo guardar la respuesta." }, { status: 500 });
  }

  await touchConversation(conversationId);

  return NextResponse.json({
    conversationId,
    userMessageId: userMessage.id,
    messageId: assistantMessage.id,
    message,
    safetyFlag: "none",
    crisis: false
  });
}

async function getCharacter(characterId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_characters")
    .select("id, name, description, system_prompt, image_url, active")
    .eq("id", characterId)
    .eq("active", true)
    .maybeSingle();

  return data ?? getFallbackCharacter(characterId) ?? AI_CHARACTERS[0];
}

async function resolveConversation({
  requestedConversationId,
  characterId,
  userId,
  firstMessage
}: {
  requestedConversationId?: string | null;
  characterId: string;
  userId: string;
  firstMessage: string;
}) {
  const supabase = await createClient();

  if (requestedConversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", requestedConversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (data?.id) return data.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      character_id: characterId,
      title: titleFromMessage(firstMessage)
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("No se pudo crear la conversación.");
  }

  return data.id;
}

async function touchConversation(conversationId: string) {
  const supabase = await createClient();
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

function extractOutputText(payload: unknown) {
  const responsePayload = payload as { output_text?: unknown };

  if (
    responsePayload &&
    typeof responsePayload === "object" &&
    typeof responsePayload.output_text === "string"
  ) {
    return responsePayload.output_text;
  }

  const output = (payload as { output?: Array<{ content?: Array<{ text?: string }> }> })?.output;
  const text = output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n");

  return text || "Estoy aquí contigo. ¿Qué sería un paso pequeño y seguro ahora?";
}
