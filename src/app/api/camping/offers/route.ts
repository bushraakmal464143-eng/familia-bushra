import { NextResponse } from "next/server";
import {
  generateOfferId,
  getOffers,
  getOffersByCamping,
  upsertOffer,
} from "@/lib/offers-store";
import { getCampingById } from "@/lib/campings-store";
import {
  inferDisplayPagesFromFlags,
  sanitizeDisplayPages,
} from "@/lib/offer-display-pages";
import { getSessionSubject } from "@/lib/role-session";
import type { OfferRecord, OfferStatus } from "@/lib/types";

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
      {
        error:
          "Tu camping debe estar aprobado por un administrador antes de crear ofertas",
      },
      { status: 403 }
    );
  }
  if (!camping.profileComplete) {
    return NextResponse.json(
      { error: "Completa la ficha del camping antes de crear ofertas" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as Partial<OfferRecord>;
  const existing = await getOffers();
  const setting =
    body.setting === "beach" || body.setting === "mountain"
      ? body.setting
      : undefined;
  const petFriendly =
    typeof body.petFriendly === "boolean" ? body.petFriendly : undefined;
  const isGlamping =
    typeof body.isGlamping === "boolean" ? body.isGlamping : undefined;
  const displayPages =
    sanitizeDisplayPages(body.displayPages) ??
    inferDisplayPagesFromFlags({
      setting,
      petFriendly,
      isGlamping,
      isHotel: false,
    });

  // Campsite owners can only save drafts or submit for admin approval.
  const requestedStatus = body.status as OfferStatus | undefined;
  const status: OfferStatus =
    requestedStatus === "draft" ? "draft" : "pending";

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
    setting,
    petFriendly,
    isGlamping,
    displayPages,
    isHotel: false,
    status,
    featured: false,
  };

  if (!offer.title || offer.priceFrom <= 0) {
    return NextResponse.json({ error: "Título y precio obligatorios" }, { status: 400 });
  }

  await upsertOffer(offer);
  return NextResponse.json(offer, { status: 201 });
}
