import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PSY | Apoyo emocional diario",
  description:
    "PSY ofrece acompañamiento emocional educativo con IA en español, ejercicios y planes de prevención."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
