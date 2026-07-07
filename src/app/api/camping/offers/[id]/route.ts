import { NextResponse } from "next/server";
import { deleteOffer, getOfferById, upsertOffer } from "@/lib/offers-store";
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
  const offer: OfferRecord = {
    ...current,
    ...body,
    id,
    campingId,
    featured: false,
    priceFrom: Number(body.priceFrom ?? current.priceFrom),
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
