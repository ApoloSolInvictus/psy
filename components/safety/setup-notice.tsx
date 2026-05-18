import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="border-violet/25 bg-white shadow-soft">
      <CardHeader>
        <CardTitle>Configura Supabase para activar el MVP</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en
          `.env.local`, ejecuta el SQL de `supabase/schema.sql` y reinicia el servidor.
        </p>
        <p>La interfaz puede compilar sin credenciales, pero auth y datos requieren Supabase.</p>
      </CardContent>
    </Card>
  );
}
