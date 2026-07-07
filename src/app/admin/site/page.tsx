import Link from "next/link";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { getSiteSettings } from "@/lib/site-settings-store";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <Link href="/admin" className="text-sm text-brand-accent hover:underline">
        ← Panel
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Contenido de la web</h1>
      <p className="mt-1 text-gray-600">
        Edita textos, marca y secciones visibles en la página pública. Los cambios
        se aplican al instante.
      </p>
      <p className="mt-2 text-xs text-gray-400">
        Última actualización:{" "}
        {new Date(settings.updatedAt).toLocaleString("es-ES")}
      </p>
      <div className="mt-8 max-w-3xl">
        <SiteSettingsForm initial={settings} />
      </div>
    </div>
  );
}
