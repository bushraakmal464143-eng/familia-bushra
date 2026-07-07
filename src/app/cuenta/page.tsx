import Link from "next/link";
import { getBookings } from "@/lib/bookings-store";
import { getOfferById } from "@/lib/offers-store";
import { formatBookingStatus } from "@/lib/stats";
import { getSessionSubject } from "@/lib/role-session";

export default async function CuentaPage() {
  const customerId = await getSessionSubject("customer");
  if (!customerId) return null;

  const bookings = (await getBookings())
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const withOffers = await Promise.all(
    bookings.map(async (b) => ({
      booking: b,
      offer: await getOfferById(b.offerId),
    }))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
      <p className="mt-1 text-gray-600">
        Contrata ofertas desde la web y completa el pago aquí.
      </p>

      <div className="mt-8 space-y-4">
        {withOffers.map(({ booking, offer }) => (
          <div
            key={booking.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {offer?.title ?? `Oferta #${booking.offerId}`}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {booking.checkIn} → {booking.checkOut} · {booking.guests}{" "}
                  personas
                </p>
                <p className="mt-2 text-lg font-bold text-brand-accent">
                  {booking.totalAmount} €
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    booking.status === "paid"
                      ? "text-brand-green"
                      : "text-brand-accent"
                  }`}
                >
                  {formatBookingStatus(booking.status)}
                </p>
              </div>
              {booking.status === "pending" && (
                <Link
                  href={`/pago?booking=${booking.id}`}
                  className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Pagar ahora
                </Link>
              )}
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-600">Aún no tienes reservas.</p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-brand-accent hover:underline"
            >
              Explorar ofertas →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
