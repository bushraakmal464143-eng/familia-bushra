import OfferForm from "@/components/admin/OfferForm";
import { getCampings, stripCampingSecrets } from "@/lib/campings-store";

export default async function NewOfferPage() {
  const campings = (await getCampings()).map((c) => {
    const safe = stripCampingSecrets(c);
    return { id: safe.id, name: safe.name };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nueva oferta</h1>
      <p className="mt-1 text-gray-600">
        Los cambios se publican al instante en la web.
      </p>
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <OfferForm mode="create" campings={campings} />
      </div>
    </div>
  );
}
