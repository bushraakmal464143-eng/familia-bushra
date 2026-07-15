import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookings } from "@/lib/bookings-store";
import { getCustomerById, stripCustomerSecrets } from "@/lib/customers-store";
import { getOffers } from "@/lib/offers-store";
import { formatBookingStatus } from "@/lib/stats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const safe = stripCustomerSecrets(customer);
  const [bookings, offers] = await Promise.all([getBookings(), getOffers()]);
  const customerBookings = bookings
    .filter(
      (b) =>
        b.customerId === customer.id ||
        b.customerEmail.toLowerCase() === customer.email.toLowerCase()
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const paid = customerBookings.filter((b) => b.status === "paid");
  const revenue = paid.reduce((sum, b) => sum + b.totalAmount, 0);
  const offerById = Object.fromEntries(offers.map((o) => [o.id, o]));

  return (
    <div>
      <Link
        href="/admin/clientes"
        className="text-sm text-brand-accent hover:underline"
      >
        ← Clientes
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">{safe.name}</h1>
      <p className="text-gray-600">{safe.email}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard label="ID" value={safe.id} />
        <DetailCard
          label="Fecha de alta"
          value={format(new Date(safe.createdAt), "d MMM yyyy HH:mm", {
            locale: es,
          })}
        />
        <DetailCard
          label="Método de acceso"
          value={
            customer.googleId
              ? "Google"
              : customer.passwordHash
                ? "Email y contraseña"
                : "—"
          }
        />
        <DetailCard
          label="Google ID"
          value={customer.googleId ?? "—"}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Reservas totales</p>
          <p className="text-2xl font-bold text-brand-forest">
            {customerBookings.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Reservas pagadas</p>
          <p className="text-2xl font-bold text-brand-accent">{paid.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total gastado</p>
          <p className="text-2xl font-bold">{revenue} €</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">Reservas del cliente</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {customerBookings.length === 0 ? (
            <p className="p-6 text-sm text-gray-600">
              Este cliente aún no tiene reservas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Oferta</th>
                    <th className="px-4 py-3 font-medium">Entrada / Salida</th>
                    <th className="px-4 py-3 font-medium">Huéspedes</th>
                    <th className="px-4 py-3 font-medium">Importe</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {format(new Date(booking.createdAt), "d MMM yyyy", {
                          locale: es,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {offerById[booking.offerId]?.title ?? booking.offerId}
                        </p>
                        {booking.accommodationName && (
                          <p className="text-xs text-gray-500">
                            {booking.accommodationName}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {booking.checkIn} → {booking.checkOut}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{booking.guests}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {booking.totalAmount} €
                      </td>
                      <td className="px-4 py-3">
                        {formatBookingStatus(booking.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-all font-medium text-gray-900">{value}</p>
    </div>
  );
}
