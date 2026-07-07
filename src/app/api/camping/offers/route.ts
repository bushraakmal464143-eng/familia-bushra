import { NextResponse } from "next/server";
import {
  generateOfferId,
  getOffers,
  getOffersByCamping,
  upsertOffer,
} from "@/lib/offers-store";
import { getCampingById } from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";
import type { OfferRecord } from "@/lib/types";

export async function GET() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const offers = await getOffersByCamping(campingId);
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const camping = await getCampingById(campingId);
  if (!camping || camping.status !== "active") {
    return NextResponse.json(
      { error: "Tu camping debe estar activo para publicar ofertas" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as Partial<OfferRecord>;
  const existing = await getOffers();
  const offer: OfferRecord = {
    id: generateOfferId(existing),
    campingId,
    title: body.title?.trim() ?? "",
    subtitle: body.subtitle?.trim() ?? camping.name,
    location: body.location?.trim() || camping.location,
    region: body.region?.trim() || camping.region,
    mealPlan: body.mealPlan?.trim() || undefined,
    highlights: Array.isArray(body.highlights) ? body.highlights.filter(Boolean) : [],
    description: body.description?.trim() ?? "",
    travelDates: body.travelDates?.trim() ?? "",
    priceFrom: Number(body.priceFrom) || 0,
    image: body.image?.trim() || camping.photos[0] || "/offers/cabin-style.png",
    gallery: body.gallery,
    badge: body.badge?.trim() || undefined,
    category: body.category ?? "new",
    status: body.status ?? "active",
    featured: false,
  };

  if (!offer.title || offer.priceFrom <= 0) {
    return NextResponse.json({ error: "Título y precio obligatorios" }, { status: 400 });
  }

  await upsertOffer(offer);
  return NextResponse.json(offer, { status: 201 });
}
