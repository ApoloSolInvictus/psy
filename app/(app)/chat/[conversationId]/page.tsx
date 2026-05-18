import { notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { AI_CHARACTERS, type AiCharacter } from "@/lib/characters";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCharacters(): Promise<AiCharacter[]> {
  if (!isSupabaseConfigured()) return AI_CHARACTERS;

  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_characters")
    .select("id, name, description, system_prompt, image_url, active")
    .eq("active", true)
    .order("name");

  return data?.length ? data : AI_CHARACTERS;
}

export default async function ConversationPage({
  params
}: {
  params: { conversationId: string };
}) {
  const characters = await getCharacters();

  if (!isSupabaseConfigured()) {
    return <ChatInterface characters={characters} />;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, title, character_id")
    .eq("id", params.conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, safety_flag")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  return (
    <ChatInterface
      characters={characters}
      conversationId={conversation.id}
      initialCharacterId={conversation.character_id}
      title={conversation.title}
      initialMessages={(messages ?? [])
        .filter((message) => message.role !== "system")
        .map((message) => ({
          id: message.id,
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
          safety_flag: message.safety_flag
        }))}
    />
  );
}
