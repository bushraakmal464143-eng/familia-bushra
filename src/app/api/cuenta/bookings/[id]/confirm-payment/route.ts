import { NextResponse } from "next/server";
import { getBookingById, setBookingStatus } from "@/lib/bookings-store";
import { getSessionSubject } from "@/lib/role-session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

type Ctx = { params: Promise<{ id: string }> };

/**
 * After Stripe Checkout success redirect, verify the session and mark paid.
 * Webhook is the source of truth in production; this covers local test without tunneling.
 */
export async function POST(request: Request, context: Ctx) {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe no está configurado." },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const body = (await request.json()) as { sessionId?: string };
  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  }

  const booking = await getBookingById(id);
  if (!booking || booking.customerId !== customerId) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  if (booking.status === "paid") {
    return NextResponse.json({ ok: true, booking });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.bookingId !== booking.id) {
    return NextResponse.json({ error: "Sesión no válida" }, { status: 400 });
  }
  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "El pago aún no está completado" },
      { status: 400 }
    );
  }

  const updated = await setBookingStatus(id, "paid");
  return NextResponse.json({ ok: true, booking: updated });
}
