import AdminBookingsCalendar from "@/components/admin/AdminBookingsCalendar";
import { getBookings } from "@/lib/bookings-store";
import { getCampings } from "@/lib/campings-store";
import { getOffers } from "@/lib/offers-store";

export const dynamic = "force-dynamic";

export default async function AdminCalendarioPage() {
  const [bookings, campings, offers] = await Promise.all([
    getBookings(),
    getCampings(),
    getOffers(),
  ]);

  const campingName = Object.fromEntries(campings.map((c) => [c.id, c.name]));
  const offerTitle = Object.fromEntries(offers.map((o) => [o.id, o.title]));

  const rows = bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    campingName: campingName[b.campingId] ?? b.campingId,
    offerTitle: offerTitle[b.offerId] ?? b.offerId,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    status: b.status,
    totalAmount: b.totalAmount,
  }));

  const active = rows.filter((b) => b.status !== "cancelled").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Booking calendar</h1>
      <p className="mt-1 text-gray-600">
        See which dates have bookings and which are free.{" "}
        {active} active booking{active === 1 ? "" : "s"} in the system.
      </p>

      <div className="mt-8">
        <AdminBookingsCalendar bookings={rows} />
      </div>
    </div>
  );
}
