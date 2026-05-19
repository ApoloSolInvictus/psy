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

export default async function ChatPage({
  searchParams
}: {
  searchParams: Promise<{ character?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const characters = await getCharacters();

  return (
    <ChatInterface
      characters={characters}
      initialCharacterId={resolvedSearchParams.character ?? characters[0]?.id}
    />
  );
}
