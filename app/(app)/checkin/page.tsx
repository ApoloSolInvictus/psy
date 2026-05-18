import { CheckinForm } from "@/components/forms/checkin-form";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { Badge } from "@/components/ui/badge";

export default function CheckinPage() {
  return (
    <div className="space-y-6">
      <section>
        <Badge variant="calm">Diario emocional</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-ocean">Check-in diario</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Registrar señales pequeñas ayuda a ver patrones sin juzgar el día.
        </p>
      </section>
      <SafetyBanner />
      <CheckinForm />
    </div>
  );
}
