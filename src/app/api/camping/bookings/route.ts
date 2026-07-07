import { NextResponse } from "next/server";
import { getBookings } from "@/lib/bookings-store";
import { getSessionSubject } from "@/lib/role-session";

export async function GET() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const bookings = await getBookings();
  return NextResponse.json(
    bookings
      .filter((b) => b.campingId === campingId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}
