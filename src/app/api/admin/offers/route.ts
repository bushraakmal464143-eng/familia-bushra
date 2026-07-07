import { NextResponse } from "next/server";
import {
  generateOfferId,
  getOffers,
  upsertOffer,
} from "@/lib/offers-store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { MAX_GALLERY_IMAGES } from "@/lib/image-upload-limits";
import { cleanSubtitle } from "@/lib/clean-offer-text";
import { sanitizeOfferAccommodations } from "@/lib/offer-accommodation-units";
import { parseMapCoordinate } from "@/lib/offer-map";
import type { OfferRecord } from "@/lib/types";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const offers = await getOffers();
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as Partial<OfferRecord>;
  const existing = await getOffers();

  const gallery =
    Array.isArray(body.gallery) && body.gallery.length > 0
      ? body.gallery.map((s) => String(s).trim()).filter(Boolean).slice(0, MAX_GALLERY_IMAGES)
      : undefined;

  const nightsOptions =
    Array.isArray(body.nightsOptions) && body.nightsOptions.length > 0
      ? body.nightsOptions
          .map((n) => Number(n))
          .filter((n) => Number.isFinite(n) && n > 0)
          .map((n) => Math.floor(n))
          .slice(0, 12)
      : undefined;

  const countdownProgress =
    body.countdownProgress != null && Number.isFinite(Number(body.countdownProgress))
      ? Math.max(0, Math.min(100, Number(body.countdownProgress)))
      : undefined;

  const image = body.image?.trim() ?? "/offers/cabin-style.png";
  const priceFrom = Number(body.priceFrom) || 0;
  const accommodations = sanitizeOfferAccommodations(body.accommodations, {
    priceFrom,
    image,
  });

  const offer: OfferRecord = {
    id: body.id?.trim() || generateOfferId(existing),
    campingId: body.campingId?.trim() || "camp_1",
    title: body.title?.trim() ?? "",
    subtitle: cleanSubtitle(body.subtitle?.trim() ?? ""),
    location: body.location?.trim() ?? "",
    region: body.region?.trim() ?? "",
    mealPlan: body.mealPlan?.trim() || undefined,
    highlights: Array.isArray(body.highlights)
      ? body.highlights.filter(Boolean)
      : [],
    description: body.description?.trim() ?? "",
    travelDates: body.travelDates?.trim() ?? "",
    priceFrom,
    image,
    gallery,
    badge: body.badge?.trim() || undefined,
    countdown: body.countdown?.trim() || undefined,
    countdownProgress,
    nightsOptions,
    ctaText: body.ctaText?.trim() || undefined,
    accommodationName: body.accommodationName?.trim() || undefined,
    accommodationLinkText: body.accommodationLinkText?.trim() || undefined,
    accommodations,
    mapLabel: body.mapLabel?.trim() || undefined,
    mapLat: parseMapCoordinate(body.mapLat, "lat"),
    mapLng: parseMapCoordinate(body.mapLng, "lng"),
    category: body.category ?? "new",
    status: body.status ?? "active",
    featured: Boolean(body.featured),
  };

  if (!offer.title) {
    return NextResponse.json(
      { error: "El título es obligatorio" },
      { status: 400 }
    );
  }

  if (existing.some((o) => o.id === offer.id && body.id)) {
    return NextResponse.json(
      { error: "Ya existe una oferta con ese ID" },
      { status: 409 }
    );
  }

  await upsertOffer(offer);
  return NextResponse.json(offer, { status: 201 });
}
