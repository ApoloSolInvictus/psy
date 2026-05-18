import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md bg-white shadow-soft">
        <CardHeader>
          <CardTitle>No se pudo confirmar la sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>El enlace pudo expirar o ya fue usado.</p>
          <Button asChild>
            <Link href="/login">Volver a entrar</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
