"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, ShieldAlert, UserRound } from "lucide-react";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AiCharacter } from "@/lib/characters";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  safety_flag?: string | null;
};

type ChatInterfaceProps = {
  characters: AiCharacter[];
  initialCharacterId?: string;
  conversationId?: string;
  initialMessages?: ChatMessage[];
  title?: string | null;
};

export function ChatInterface({
  characters,
  initialCharacterId,
  conversationId,
  initialMessages = [],
  title
}: ChatInterfaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    initialCharacterId ?? characters[0]?.id ?? ""
  );
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? characters[0],
    [characters, selectedCharacterId]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isPending) return;

    setError(null);
    setInput("");
    const optimisticUserMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content
    };
    setMessages((current) => [...current, optimisticUserMessage]);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            characterId: selectedCharacterId,
            conversationId
          })
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "No se pudo responder ahora.");
          return;
        }

        setMessages((current) => [
          ...current,
          {
            id: payload.messageId ?? `assistant-${Date.now()}`,
            role: "assistant",
            content: payload.message,
            safety_flag: payload.safetyFlag
          }
        ]);

        if (!conversationId && payload.conversationId) {
          router.replace(`/chat/${payload.conversationId}`);
        }
        router.refresh();
      })();
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4">
        <Card className="bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Personaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              value={selectedCharacterId}
              onChange={(event) => setSelectedCharacterId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              disabled={Boolean(conversationId)}
              aria-label="Seleccionar personaje"
            >
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
            <p className="text-sm leading-6 text-muted-foreground">
              {selectedCharacter?.description}
            </p>
          </CardContent>
        </Card>
        <SafetyBanner />
      </aside>

      <section className="min-h-[68vh] rounded-lg border bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div>
            <Badge variant="calm">{selectedCharacter?.name ?? "PSY"}</Badge>
            <h1 className="mt-2 text-xl font-semibold text-ocean">
              {title ?? "Nueva conversación"}
            </h1>
          </div>
          <Bot className="h-6 w-6 text-violet" aria-hidden="true" />
        </div>

        <div className="flex min-h-[430px] flex-col gap-4 p-4">
          {messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-violet">
                    {message.safety_flag && message.safety_flag !== "none" ? (
                      <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Bot className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>
                ) : null}
                <div
                  className={cn(
                    "max-w-[82%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.content}
                </div>
                {message.role === "user" ? (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-ocean">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Escribe lo que necesitas ordenar hoy.
            </div>
          )}
        </div>

        <form className="border-t p-4" onSubmit={handleSubmit}>
          {error ? <p className="mb-3 rounded-md bg-destructive/10 p-3 text-sm">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Cuéntame qué está pasando..."
              className="min-h-[76px] flex-1"
            />
            <Button className="sm:self-end" type="submit" disabled={isPending || !input.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Enviar
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
