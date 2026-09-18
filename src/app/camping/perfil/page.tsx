import Link from "next/link";
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
  const underReview = complete && camping.status === "pending";

  if (underReview) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl border border-blue-100 bg-blue-50 p-8 text-center shadow-sm sm:p-10">
          <p className="text-2xl font-semibold text-blue-950">Under review</p>
          <p className="mt-4 text-sm leading-relaxed text-blue-900 sm:text-base">
            Your application has been submitted. An administrator is reviewing
            your campsite. Once approved, you will be able to create offers.
          </p>
          <p className="mt-6 text-sm text-blue-800">
            You can still{" "}
            <Link
              href="/camping/fotos"
              className="font-medium text-brand-accent hover:underline"
            >
              upload photos
            </Link>{" "}
            while you wait.
          </p>
          <Link
            href="/camping"
            className="mt-8 inline-flex rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Back to panel
          </Link>
        </div>
      </div>
    );
  }

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
