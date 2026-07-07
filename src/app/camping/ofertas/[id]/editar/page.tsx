import { notFound } from "next/navigation";
import CampingOfferForm from "@/components/camping/CampingOfferForm";
import { getCampingById } from "@/lib/campings-store";
import { getOfferById } from "@/lib/offers-store";
import { getSessionSubject } from "@/lib/role-session";

type Props = { params: Promise<{ id: string }> };

export default async function EditarOfertaPage({ params }: Props) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;
  const { id } = await params;
  const [offer, camping] = await Promise.all([
    getOfferById(id),
    getCampingById(campingId),
  ]);
  if (!offer || offer.campingId !== campingId || !camping) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Editar oferta</h1>
      <div className="mt-8 max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <CampingOfferForm offer={offer} photos={camping.photos} />
      </div>
    </div>
  );
}
