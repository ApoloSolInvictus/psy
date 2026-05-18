import { ShieldCheck } from "lucide-react";
import { SAFETY_REMINDER } from "@/lib/prompts";

export function SafetyBanner() {
  return (
    <div className="rounded-lg border border-calm/25 bg-calm/10 p-4 text-sm text-ocean">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-calm" aria-hidden="true" />
        <p>{SAFETY_REMINDER}</p>
      </div>
    </div>
  );
}
