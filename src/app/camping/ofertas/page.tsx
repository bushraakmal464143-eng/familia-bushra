import Image from "next/image";
import Link from "next/link";
import DeleteOfferButton from "@/components/admin/DeleteOfferButton";
import { getCampingById } from "@/lib/campings-store";
import { getOffersByCamping } from "@/lib/offers-store";
import { getSessionSubject } from "@/lib/role-session";
import type { OfferRecord } from "@/lib/types";

function offerStatusLabel(status: OfferRecord["status"]) {
  if (status === "active") return "Activa (publicada)";
  if (status === "pending") return "Pendiente de aprobación";
  if (status === "draft") return "Borrador";
  return "Inactiva";
}

function offerStatusClass(status: OfferRecord["status"]) {
  if (status === "active") return "text-brand-green";
  if (status === "pending") return "text-brand-accent";
  return "text-gray-500";
}

export default async function CampingOfertasPage() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;
  const [camping, offers] = await Promise.all([
    getCampingById(campingId),
    getOffersByCamping(campingId),
  ]);
  if (!camping) return null;

  const canCreate = camping.status === "active";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis ofertas</h1>
          <p className="mt-1 text-gray-600">{offers.length} ofertas</p>
        </div>
        {canCreate ? (
          <Link
            href="/camping/ofertas/nueva"
            className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            + Nueva oferta
          </Link>
        ) : (
          <span className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500">
            + Nueva oferta
          </span>
        )}
      </div>

      {!canCreate && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Cuando un administrador apruebe tu camping podrás crear ofertas. Cada
          oferta también necesitará aprobación antes de publicarse.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image src={offer.image} alt="" fill className="object-cover" sizes="112px" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{offer.title}</h2>
              <p className="text-sm text-gray-500">
                {offer.priceFrom} €/pers. ·{" "}
                <span className={offerStatusClass(offer.status)}>
                  {offerStatusLabel(offer.status)}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {canCreate && (
                  <Link
                    href={`/camping/ofertas/${offer.id}/editar`}
                    className="text-sm font-medium text-brand-accent hover:underline"
                  >
                    Editar
                  </Link>
                )}
                <DeleteOfferButton
                  offerId={offer.id}
                  offerTitle={offer.title}
                  apiPath={`/api/camping/offers/${offer.id}`}
                />
              </div>
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <p className="py-12 text-center text-gray-500">
            Aún no tienes ofertas. Cuando tu camping esté activo, envía una para
            que el administrador la revise.
          </p>
        )}
      </div>
    </div>
  );
}
