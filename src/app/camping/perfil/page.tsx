import CampingProfileForm from "@/components/camping/CampingProfileForm";
import { isCampingProfileComplete } from "@/lib/camping-profile";
import { getCampingById, stripCampingSecrets } from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";

export default async function CampingPerfilPage() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;

  const camping = await getCampingById(campingId);
  if (!camping) return null;

  const complete = isCampingProfileComplete(camping);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ficha del camping</h1>
      <p className="mt-1 text-gray-600">
        Completa todos los datos. Un administrador revisará tu solicitud antes de
        activar la cuenta.
      </p>

      {!complete && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tu ficha aún no está completa. Rellena teléfono, localidad, región y
          descripción para enviar la solicitud.
        </p>
      )}

      {complete && camping.status === "pending" && (
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Ficha enviada. Estamos revisando tu camping. Cuando se apruebe podrás
          crear ofertas (también pendientes de aprobación).
        </p>
      )}

      {camping.status === "active" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Tu camping está activo. Puedes actualizar estos datos en cualquier momento.
        </p>
      )}

      <div className="mt-8 max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <CampingProfileForm camping={stripCampingSecrets(camping)} />
      </div>
    </div>
  );
}
