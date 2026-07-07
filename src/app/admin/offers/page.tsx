import Image from "next/image";
import Link from "next/link";
import DeleteOfferButton from "@/components/admin/DeleteOfferButton";
import { getOffers } from "@/lib/offers-store";
import { offerTabs } from "@/lib/offers";

const categoryLabel = Object.fromEntries(
  offerTabs.filter((t) => t.id !== "all").map((t) => [t.id, t.label])
);

export default async function AdminOffersPage() {
  const offers = await getOffers();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ofertas</h1>
          <p className="mt-1 text-gray-600">{offers.length} en el catálogo</p>
        </div>
        <Link
          href="/admin/offers/new"
          className="inline-flex shrink-0 justify-center rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          + Nueva oferta
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Oferta</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Alojamientos</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image
                          src={offer.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {offer.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {offer.location}
                          {offer.featured && (
                            <span className="ml-2 text-brand-accent">
                              · Destacada
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {categoryLabel[offer.category] ?? offer.category}
                  </td>
                  <td className="px-4 py-3 font-medium">{offer.priceFrom} €</td>
                  <td className="px-4 py-3 text-gray-600">
                    {offer.accommodations?.filter((u) => u.enabled).length ?? 0}
                    {offer.accommodations?.length ? "" : " (auto)"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/offers/${offer.id}/edit`}
                        className="text-sm font-medium text-brand-forest hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteOfferButton
                        offerId={offer.id}
                        offerTitle={offer.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {offers.length === 0 && (
          <p className="px-4 py-12 text-center text-gray-500">
            No hay ofertas.{" "}
            <Link href="/admin/offers/new" className="text-brand-accent hover:underline">
              Crea la primera
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
