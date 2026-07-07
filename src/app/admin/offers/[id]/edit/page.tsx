import { notFound } from "next/navigation";
import OfferForm from "@/components/admin/OfferForm";
import { getCampings, stripCampingSecrets } from "@/lib/campings-store";
import { getOfferById } from "@/lib/offers-store";

type EditOfferPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const { id } = await params;
  const [offer, campingsRaw] = await Promise.all([
    getOfferById(id),
    getCampings(),
  ]);
  if (!offer) notFound();
  const campings = campingsRaw.map((c) => {
    const safe = stripCampingSecrets(c);
    return { id: safe.id, name: safe.name };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Editar oferta</h1>
      <p className="mt-1 text-sm text-gray-500">ID: {offer.id}</p>
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <OfferForm mode="edit" offer={offer} campings={campings} />
      </div>
    </div>
  );
}
