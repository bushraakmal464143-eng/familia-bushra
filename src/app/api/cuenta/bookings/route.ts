import { NextResponse } from "next/server";
import type { TravelerDetails } from "@/lib/types";
import { createBooking, getBookings } from "@/lib/bookings-store";
import { getOfferById } from "@/lib/offers-store";
import { getCustomerById } from "@/lib/customers-store";
import { getSessionSubject } from "@/lib/role-session";

export async function GET() {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const bookings = await getBookings();
  return NextResponse.json(
    bookings
      .filter((b) => b.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export async function POST(request: Request) {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    offerId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    adults?: number;
    children?: number;
    childAges?: number[];
    pricePerNight?: number;
    totalAmount?: number;
    accommodationId?: string;
    accommodationName?: string;
    travelerDetails?: TravelerDetails;
  };

  const customer = await getCustomerById(customerId);
  const offer = await getOfferById(body.offerId ?? "");
  if (!customer || !offer || offer.status !== "active") {
    return NextResponse.json({ error: "Oferta no disponible" }, { status: 400 });
  }

  const checkIn = body.checkIn ?? "";
  const checkOut = body.checkOut ?? "";
  const adults = Math.max(1, Number(body.adults) || 0);
  const children = Math.max(0, Number(body.children) || 0);
  const guests =
    body.guests != null
      ? Math.max(1, Number(body.guests) || 1)
      : Math.max(1, adults + children);
  const pricePerNight =
    body.pricePerNight != null && body.pricePerNight > 0
      ? body.pricePerNight
      : offer.priceFrom;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Fechas no válidas" }, { status: 400 });
  }

  if (children > 0) {
    const ages = Array.isArray(body.childAges) ? body.childAges : [];
    const agesValid =
      ages.length === children &&
      ages.every((age) => Number.isInteger(age) && age >= 0 && age <= 17);
    if (!agesValid) {
      return NextResponse.json(
        { error: "Indica la edad de cada niño (0–17 años)." },
        { status: 400 }
      );
    }
  }

  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const traveler = body.travelerDetails;
  if (
    !traveler?.firstName?.trim() ||
    !traveler?.lastName?.trim() ||
    !traveler?.documentId?.trim() ||
    !traveler?.email?.trim() ||
    !traveler?.phone?.trim()
  ) {
    return NextResponse.json(
      { error: "Completa los datos del viajero principal." },
      { status: 400 }
    );
  }

  const totalAmount =
    body.totalAmount != null && body.totalAmount > 0
      ? body.totalAmount
      : undefined;

  const booking = await createBooking({
    offerId: offer.id,
    campingId: offer.campingId,
    customerId,
    customerName: `${traveler.firstName.trim()} ${traveler.lastName.trim()}`,
    customerEmail: traveler.email.trim(),
    checkIn,
    checkOut,
    guests,
    nights,
    pricePerNight,
    totalAmount,
    accommodationId: body.accommodationId,
    accommodationName: body.accommodationName,
    travelerDetails: {
      firstName: traveler.firstName.trim(),
      lastName: traveler.lastName.trim(),
      country: traveler.country?.trim() || "España",
      documentId: traveler.documentId.trim(),
      email: traveler.email.trim(),
      phoneCountryCode: traveler.phoneCountryCode?.trim() || "+34",
      phone: traveler.phone.trim(),
      requestInvoice: Boolean(traveler.requestInvoice),
      roomRequests: traveler.roomRequests?.trim() || undefined,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
