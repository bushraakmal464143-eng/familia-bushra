import { NextResponse } from "next/server";
import { getBookingById } from "@/lib/bookings-store";
import { getOfferById } from "@/lib/offers-store";
import { getSessionSubject } from "@/lib/role-session";
import {
  eurosToCents,
  getStripe,
  isStripeConfigured,
  siteBaseUrl,
} from "@/lib/stripe";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe no está configurado. Añade STRIPE_SECRET_KEY (modo test) en .env.local.",
      },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking || booking.customerId !== customerId) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: "La reserva ya fue procesada" },
      { status: 400 }
    );
  }

  const amountCents = eurosToCents(booking.totalAmount);
  if (amountCents < 50) {
    return NextResponse.json(
      { error: "El importe mínimo de pago es 0,50 €." },
      { status: 400 }
    );
  }

  const offer = await getOfferById(booking.offerId);
  const base = siteBaseUrl(request);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: offer?.title ?? `Reserva ${booking.id}`,
            description: [
              `${booking.checkIn} → ${booking.checkOut}`,
              `${booking.guests} pers.`,
              booking.nights === 1 ? "1 noche" : `${booking.nights} noches`,
              booking.accommodationName,
            ]
              .filter(Boolean)
              .join(" · "),
          },
        },
      },
    ],
    metadata: {
      bookingId: booking.id,
      customerId: booking.customerId,
    },
    success_url: `${base}/pago?booking=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/pago?booking=${booking.id}&cancelled=1`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
