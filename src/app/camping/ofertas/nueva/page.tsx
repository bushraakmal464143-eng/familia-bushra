import CampingOfferForm from "@/components/camping/CampingOfferForm";
import { getCampingById } from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";

export default async function NuevaOfertaPage() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;
  const camping = await getCampingById(campingId);
  if (!camping) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nueva oferta</h1>
      <div className="mt-8 max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <CampingOfferForm photos={camping.photos} />
      </div>
    </div>
  );
}
