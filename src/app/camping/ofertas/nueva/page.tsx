import Link from "next/link";
import CampingOfferForm from "@/components/camping/CampingOfferForm";
import { getCampingById } from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";

export default async function NuevaOfertaPage() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;
  const camping = await getCampingById(campingId);
  if (!camping) return null;

  if (camping.status !== "active") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva oferta</h1>
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tu camping aún no está aprobado. Completa tu{" "}
          <Link href="/camping/perfil" className="font-semibold underline">
            ficha
          </Link>{" "}
          y espera la activación del administrador.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nueva oferta</h1>
      <p className="mt-1 text-sm text-gray-600">
        La oferta quedará pendiente hasta que un administrador la apruebe.
      </p>
      <div className="mt-8 max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <CampingOfferForm photos={camping.photos} />
      </div>
    </div>
  );
}
