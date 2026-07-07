import { NextResponse } from "next/server";
import { getPublicOffers } from "@/lib/offers-store";

export async function GET() {
  const offers = await getPublicOffers();
  return NextResponse.json(offers);
}
