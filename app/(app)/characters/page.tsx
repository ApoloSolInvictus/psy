import Link from "next/link";
import { Bot, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function CharactersPage() {
  const characters = await getCharacters();

  return (
    <div className="space-y-6">
      <section>
        <Badge variant="violet">Personajes IA</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-ocean">Elige cómo quieres conversar</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cada personaje mantiene las mismas reglas clínicas de seguridad y cambia su estilo de
          acompañamiento.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {characters.map((character) => (
          <Card key={character.id} className="bg-white shadow-soft">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-accent text-violet">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle>{character.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="min-h-[72px] text-sm leading-6 text-muted-foreground">
                {character.description}
              </p>
              <Button asChild className="w-full">
                <Link href={`/chat?character=${character.id}`}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Conversar
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
