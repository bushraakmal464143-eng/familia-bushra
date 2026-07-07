import { NextResponse } from "next/server";
import { getBookingById, setBookingStatus } from "@/lib/bookings-store";
import { getSessionSubject } from "@/lib/role-session";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking || booking.customerId !== customerId) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ error: "La reserva ya fue procesada" }, { status: 400 });
  }
  const updated = await setBookingStatus(id, "paid");
  return NextResponse.json(updated);
}
