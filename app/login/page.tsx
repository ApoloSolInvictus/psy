import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { SafetyBanner } from "@/components/safety/safety-banner";

export default function LoginPage() {
  return (
    <main className="soft-focus flex min-h-screen items-center px-4 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" className="mb-8 inline-block text-xl font-semibold text-ocean">
          PSY
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold text-ocean">Vuelve a tu espacio seguro.</h1>
            <SafetyBanner />
          </div>
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
