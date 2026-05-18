import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarCheck,
  CreditCard,
  HeartHandshake,
  Home,
  MessageCircle,
  ShieldAlert
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/characters", label: "Personajes", icon: Bot },
  { href: "/checkin", label: "Check-in", icon: Activity },
  { href: "/exercises", label: "Ejercicios", icon: CalendarCheck },
  { href: "/crisis-plan", label: "Plan", icon: HeartHandshake },
  { href: "/billing", label: "Perfil", icon: CreditCard }
];

type AppShellProps = {
  children: React.ReactNode;
  userEmail?: string | null;
  plan?: string | null;
};

export function AppShell({ children, userEmail, plan }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b px-5 py-5">
            <Link href="/dashboard" className="text-xl font-semibold text-ocean">
              PSY
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{plan ?? "Plan free"}</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            {userEmail ? (
              <>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                <LogoutButton />
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Modo configuración</p>
            )}
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <Link href="/dashboard" className="font-semibold text-ocean lg:hidden">
              PSY
            </Link>
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto lg:hidden">
              {navItems.slice(0, 6).map((item) => (
                <Button key={item.href} asChild variant="ghost" size="icon" title={item.label}>
                  <Link href={item.href} aria-label={item.label}>
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ))}
            </div>
            <Button asChild variant="destructive" size="sm" className="shrink-0">
              <Link href="/crisis-plan#ayuda-ahora">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Ayuda ahora
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
