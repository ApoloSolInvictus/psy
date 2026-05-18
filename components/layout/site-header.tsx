import Link from "next/link";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ocean">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
          </span>
          PSY
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/characters" className="hover:text-foreground">
            Personajes
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Seguridad
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Crear cuenta
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
