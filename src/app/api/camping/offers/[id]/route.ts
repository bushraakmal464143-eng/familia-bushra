import { NextResponse } from "next/server";
import { deleteOffer, getOfferById, upsertOffer } from "@/lib/offers-store";
import { getCampingById } from "@/lib/campings-store";
import {
  inferDisplayPagesFromFlags,
  sanitizeDisplayPages,
} from "@/lib/offer-display-pages";
import { getSessionSubject } from "@/lib/role-session";
import type { OfferRecord, OfferStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Ctx) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const camping = await getCampingById(campingId);
  if (!camping || camping.status !== "active") {
    return NextResponse.json(
      { error: "Tu camping debe estar activo para editar ofertas" },
      { status: 403 }
    );
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

  const requestedStatus = body.status as OfferStatus | undefined;
  let status: OfferStatus = current.status;
  if (requestedStatus === "draft") {
    status = "draft";
  } else if (
    requestedStatus === "pending" ||
    requestedStatus === "inactive" ||
    current.status === "active" ||
    current.status === "pending"
  ) {
    // Any publish/edit from the portal needs admin re-approval.
    status = "pending";
  }

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
    isHotel: false,
    status,
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
