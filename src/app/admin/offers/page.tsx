import Link from "next/link";
import AdminOffersTable from "@/components/admin/AdminOffersTable";
import { getOffers } from "@/lib/offers-store";

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

      <AdminOffersTable offers={offers} />
    </div>
  );
}
