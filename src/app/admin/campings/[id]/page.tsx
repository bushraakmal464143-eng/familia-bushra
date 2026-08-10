import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApproveOfferButton from "@/components/admin/ApproveOfferButton";
import CampingStatusForm from "@/components/admin/CampingStatusForm";
import {
  getBookings,
  sumPaidRevenue,
} from "@/lib/bookings-store";
import { isCampingProfileComplete } from "@/lib/camping-profile";
import { getCampingById, stripCampingSecrets } from "@/lib/campings-store";
import { getOffersByCamping } from "@/lib/offers-store";
import { formatBookingStatus } from "@/lib/stats";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCampingDetailPage({ params }: Props) {
  const { id } = await params;
  const camping = await getCampingById(id);
  if (!camping) notFound();

  const safe = stripCampingSecrets(camping);
  const profileComplete = isCampingProfileComplete(camping);
  const [offers, allBookings] = await Promise.all([
    getOffersByCamping(id),
    getBookings(),
  ]);
  const bookings = allBookings
    .filter((b) => b.campingId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pendingOffers = offers.filter((o) => o.status === "pending");

  return (
    <div>
      <Link href="/admin/campings" className="text-sm text-brand-accent hover:underline">
        ← Campings
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{safe.name}</h1>
      <p className="text-gray-600">
        {safe.email} · {safe.location || "Sin localidad"}, {safe.region || "sin región"}
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Estado del camping</h2>
        {!profileComplete && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            La ficha aún no está completa (faltan datos de contacto o ubicación).
            Espera a que el camping complete su perfil antes de aprobar.
          </p>
        )}
        {profileComplete && camping.status === "pending" && (
          <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Ficha completa. Puedes activar el camping para que pueda enviar ofertas.
          </p>
        )}
        <div className="mt-3">
          <CampingStatusForm campingId={id} currentStatus={camping.status} />
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Datos de la ficha</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Teléfono</dt>
            <dd className="font-medium text-gray-900">{safe.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Ficha completa</dt>
            <dd className="font-medium text-gray-900">
              {profileComplete ? "Sí" : "No"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Descripción</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-800">
              {safe.description || "—"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Ofertas activas</p>
          <p className="text-2xl font-bold text-brand-forest">
            {offers.filter((o) => o.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Ofertas por aprobar</p>
          <p className="text-2xl font-bold text-brand-accent">{pendingOffers.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-2xl font-bold">{sumPaidRevenue(bookings)} €</p>
        </div>
      </div>

      {safe.photos.length > 0 && (
        <section className="mt-10">
          <h2 className="font-bold text-gray-900">Fotografías</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {safe.photos.map((url) => (
              <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-bold text-gray-900">Ofertas ({offers.length})</h2>
        <ul className="mt-4 space-y-2">
          {offers.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium text-gray-900">{o.title}</span>
                <span className="ml-2 text-gray-500">
                  {o.status} · {o.priceFrom} €
                </span>
              </div>
              <div className="flex items-center gap-3">
                {o.status === "pending" && (
                  <>
                    <ApproveOfferButton offerId={o.id} />
                    <ApproveOfferButton offerId={o.id} reject />
                  </>
                )}
                <Link
                  href={`/admin/offers/${o.id}/edit`}
                  className="font-medium text-brand-forest hover:underline"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
          {offers.length === 0 && (
            <li className="text-sm text-gray-500">Sin ofertas todavía.</li>
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-gray-900">Ventas y reservas</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Fechas</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 align-middle font-medium text-gray-900">
                      {b.customerName}
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-700">
                      {b.checkIn} → {b.checkOut}
                    </td>
                    <td className="px-4 py-3 align-middle font-medium text-gray-900">
                      {b.totalAmount} €
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          b.status === "paid"
                            ? "bg-green-100 text-brand-green"
                            : b.status === "pending"
                              ? "bg-orange-100 text-brand-accent"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatBookingStatus(b.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">Sin ventas aún.</p>
          )}
        </div>
      </section>
    </div>
  );
}
