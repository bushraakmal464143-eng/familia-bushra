import PhotoManager from "@/components/camping/PhotoManager";
import { getCampingById } from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";

export default async function CampingFotosPage() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;
  const camping = await getCampingById(campingId);
  if (!camping) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Fotografías</h1>
      <p className="mt-1 text-gray-600">
        Sube imágenes de tu camping para usarlas en tus ofertas.
      </p>
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <PhotoManager initialPhotos={camping.photos} />
      </div>
    </div>
  );
}
