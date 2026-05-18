import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function titleFromMessage(message: string) {
  const clean = message.trim().replace(/\s+/g, " ");
  if (!clean) return "Nueva conversación";
  return clean.length > 54 ? `${clean.slice(0, 54)}...` : clean;
}
