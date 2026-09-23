import Image from "next/image";
import Link from "next/link";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import CustomerBookingsCalendar from "@/components/cuenta/CustomerBookingsCalendar";
import CustomerProfileForm from "@/components/cuenta/CustomerProfileForm";
import { getBookings } from "@/lib/bookings-store";
import { getCustomerById } from "@/lib/customers-store";
import { getOfferById } from "@/lib/offers-store";
import { formatBookingStatus } from "@/lib/stats";
import { getSessionSubject } from "@/lib/role-session";
import type { Booking, OfferRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

type BookingRow = {
  booking: Booking;
  offer: OfferRecord | undefined;
};

export default async function CuentaPage() {
  const customerId = await getSessionSubject("customer");
  if (!customerId) return null;

  const customer = await getCustomerById(customerId);
  if (!customer) return null;

  const bookings = (await getBookings())
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const withOffers: BookingRow[] = await Promise.all(
    bookings.map(async (b) => ({
      booking: b,
      offer: await getOfferById(b.offerId),
    }))
  );

  const today = startOfDay(new Date());
  const upcoming = withOffers.filter(
    ({ booking }) =>
      booking.status !== "cancelled" &&
      !isBefore(parseISO(booking.checkOut), today)
  );
  const past = withOffers.filter(
    ({ booking }) =>
      booking.status === "cancelled" ||
      isBefore(parseISO(booking.checkOut), today)
  );

  const paid = bookings.filter((b) => b.status === "paid");
  const pending = bookings.filter((b) => b.status === "pending");
  const spent = paid.reduce((sum, b) => sum + b.totalAmount, 0);
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const loginMethod = customer.googleId
    ? "Google"
    : customer.passwordHash
      ? "Email y contraseña"
      : "—";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Hola, {customer.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-gray-600">
          Tu perfil y reservas en un solo lugar.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-brand-forest to-brand-green px-5 py-6 text-center text-white">
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-white/15 text-2xl font-bold ring-2 ring-white/30">
                {customer.avatarUrl ? (
                  <Image
                    src={customer.avatarUrl}
                    alt={customer.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {initials || "?"}
                  </span>
                )}
              </div>
              <p className="mt-4 text-lg font-semibold">{customer.name}</p>
              <p className="mt-1 break-all text-sm text-white/80">
                {customer.email}
              </p>
            </div>

            <div className="border-b border-gray-100 px-5 py-5">
              <h2 className="text-sm font-semibold text-gray-900">
                Editar perfil
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Cambia tu foto y nombre de usuario.
              </p>
              <div className="mt-4">
                <CustomerProfileForm
                  name={customer.name}
                  email={customer.email}
                  avatarUrl={customer.avatarUrl}
                />
              </div>
            </div>

            <dl className="space-y-3 px-5 py-5 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Miembro desde
                </dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {format(new Date(customer.createdAt), "d MMMM yyyy", {
                    locale: es,
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Acceso
                </dt>
                <dd className="mt-0.5 font-medium text-gray-900">{loginMethod}</dd>
              </div>
              {customer.lastLoginAt && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Último acceso
                  </dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {format(new Date(customer.lastLoginAt), "d MMM yyyy HH:mm", {
                      locale: es,
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatChip label="Reservas" value={bookings.length} />
            <StatChip label="Pagadas" value={paid.length} />
            <StatChip label="Pendientes" value={pending.length} />
            <StatChip label="Gastado" value={`${spent} €`} />
          </div>

          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Explorar ofertas
          </Link>
        </aside>

        <section className="min-w-0 space-y-8">
          <CustomerBookingsCalendar
            bookings={withOffers.map(({ booking, offer }) => ({
              id: booking.id,
              offerTitle: offer?.title ?? `Oferta #${booking.offerId}`,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              guests: booking.guests,
              status: booking.status,
              totalAmount: booking.totalAmount,
              accommodationName: booking.accommodationName,
            }))}
          />

          <ReservationSection
            title="Próximas reservas"
            empty="No tienes reservas próximas."
            items={upcoming}
          />
          <ReservationSection
            title="Historial"
            empty="Aún no hay reservas anteriores."
            items={past}
          />
        </section>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-brand-forest">{value}</p>
    </div>
  );
}

function ReservationSection({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: BookingRow[];
}) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-500">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="text-sm text-gray-600">{empty}</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-brand-accent hover:underline"
          >
            Buscar ofertas →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map(({ booking, offer }) => (
            <li
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-brand-accent/30 hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 w-full shrink-0 bg-brand-cream sm:h-auto sm:min-h-[160px] sm:w-40">
                  {offer?.image ? (
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center text-sm text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {offer?.title ?? `Oferta #${booking.offerId}`}
                      </h3>
                      <StatusPill status={booking.status} />
                    </div>
                    {(offer?.location || booking.accommodationName) && (
                      <p className="mt-1 text-sm text-gray-500">
                        {[booking.accommodationName, offer?.location]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-gray-700">
                      <span className="font-medium">
                        {format(parseISO(booking.checkIn), "d MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                      {" → "}
                      <span className="font-medium">
                        {format(parseISO(booking.checkOut), "d MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                      {" · "}
                      {booking.nights}{" "}
                      {booking.nights === 1 ? "noche" : "noches"}
                      {" · "}
                      {booking.guests}{" "}
                      {booking.guests === 1 ? "persona" : "personas"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xl font-bold text-brand-accent">
                      {booking.totalAmount} €
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {offer && (
                        <Link
                          href={`/ofertas/${offer.id}`}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Ver oferta
                        </Link>
                      )}
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
    pending:
      "bg-orange-50 text-brand-accent ring-1 ring-inset ring-orange-600/15",
    cancelled: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/15",
  };
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {formatBookingStatus(status)}
    </span>
  );
}
