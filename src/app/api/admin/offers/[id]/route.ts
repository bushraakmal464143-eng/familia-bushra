import { NextResponse } from "next/server";
import { deleteOffer, getOfferById, upsertOffer } from "@/lib/offers-store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { MAX_GALLERY_IMAGES } from "@/lib/image-upload-limits";
import { sanitizeOfferAccommodations } from "@/lib/offer-accommodation-units";
import { parseMapCoordinate } from "@/lib/offer-map";
import type { OfferRecord } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  const offer = await getOfferById(id);
  if (!offer) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  return NextResponse.json(offer);
}

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  const current = await getOfferById(id);
  if (!current) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = (await request.json()) as Partial<OfferRecord>;
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

  const image = body.image?.trim() ?? current.image;
  const priceFrom = Number(body.priceFrom ?? current.priceFrom);
  const accommodations =
    body.accommodations !== undefined
      ? sanitizeOfferAccommodations(body.accommodations, { priceFrom, image })
      : current.accommodations;

  const mapLat =
    body.mapLat !== undefined
      ? parseMapCoordinate(body.mapLat, "lat")
      : current.mapLat;
  const mapLng =
    body.mapLng !== undefined
      ? parseMapCoordinate(body.mapLng, "lng")
      : current.mapLng;

  const offer: OfferRecord = {
    ...current,
    ...body,
    id,
    priceFrom,
    image,
    highlights: Array.isArray(body.highlights)
      ? body.highlights.filter(Boolean)
      : current.highlights,
    gallery: gallery ?? current.gallery,
    nightsOptions: nightsOptions ?? current.nightsOptions,
    countdownProgress: countdownProgress ?? current.countdownProgress,
    accommodations,
    mapLabel:
      body.mapLabel !== undefined
        ? body.mapLabel?.trim() || undefined
        : current.mapLabel,
    mapLat,
    mapLng,
    featured:
      body.featured !== undefined ? Boolean(body.featured) : current.featured,
  };

  await upsertOffer(offer);
  return NextResponse.json(offer);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  const removed = await deleteOffer(id);
  if (!removed) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
