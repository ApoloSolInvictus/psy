import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "PayPal se integrará en la segunda pasada del MVP.",
      todo: [
        "Crear producto y plan en PayPal",
        "Generar subscription approval URL",
        "Persistir paypal_subscription_id tras approval",
        "Activar premium desde webhook verificado"
      ]
    },
    { status: 501 }
  );
}
