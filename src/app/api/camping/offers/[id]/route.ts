import { NextResponse } from "next/server";
import { deleteOffer, getOfferById, upsertOffer } from "@/lib/offers-store";
import {
  inferDisplayPagesFromFlags,
  sanitizeDisplayPages,
} from "@/lib/offer-display-pages";
import { getSessionSubject } from "@/lib/role-session";
import type { OfferRecord } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Ctx) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const current = await getOfferById(id);
  if (!current || current.campingId !== campingId) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  const body = (await request.json()) as Partial<OfferRecord>;
  const setting =
    body.setting === "beach" || body.setting === "mountain"
      ? body.setting
      : current.setting;
  const petFriendly =
    typeof body.petFriendly === "boolean"
      ? body.petFriendly
      : current.petFriendly;
  const isGlamping =
    typeof body.isGlamping === "boolean"
      ? body.isGlamping
      : current.isGlamping;
  const displayPages =
    sanitizeDisplayPages(body.displayPages) ??
    inferDisplayPagesFromFlags({
      setting,
      petFriendly,
      isGlamping,
      isHotel: false,
    });

  const offer: OfferRecord = {
    ...current,
    ...body,
    id,
    campingId,
    featured: false,
    priceFrom: Number(body.priceFrom ?? current.priceFrom),
    setting,
    petFriendly,
    isGlamping,
    displayPages,
    // Never allow camping portal to mark an offer as a hotel.
    isHotel: false,
  };
  await upsertOffer(offer);
  return NextResponse.json(offer);
}

export async function DELETE(_request: Request, context: Ctx) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const current = await getOfferById(id);
  if (!current || current.campingId !== campingId) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  await deleteOffer(id);
  return NextResponse.json({ ok: true });
}
