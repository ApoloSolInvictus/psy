import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    received: true,
    todo: "Verificar firma PayPal, mapear eventos BILLING.SUBSCRIPTION.* y actualizar subscriptions."
  });
}
