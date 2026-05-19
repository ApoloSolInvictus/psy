"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFormProps = {
  initialName?: string | null;
  initialAvatarUrl?: string | null;
  email?: string | null;
};

export function ProfileForm({
  initialName,
  initialAvatarUrl,
  email
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, avatar_url: avatarUrl })
        });

        const payload = await response.json();
        setMessage(
          response.ok
            ? "Perfil guardado."
            : (payload.error ?? "No se pudo guardar.")
        );

        if (response.ok) {
          router.refresh();
        }
      })();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={email ?? ""} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-name">Nombre</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-avatar">Avatar URL</Label>
        <Input
          id="profile-avatar"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder="https://..."
        />
      </div>
      {message ? (
        <p className="rounded-md bg-muted p-3 text-sm">{message}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        <Save className="h-4 w-4" aria-hidden="true" />
        Guardar perfil
      </Button>
    </form>
  );
}
