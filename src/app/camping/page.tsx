import Link from "next/link";
import { getCampingById } from "@/lib/campings-store";
import { getCampingStats } from "@/lib/stats";
import { getSessionSubject } from "@/lib/role-session";

const statusLabels = {
  pending: "Pendiente de revisión",
  active: "Activo",
  suspended: "Suspendido",
};

export default async function CampingDashboardPage() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) return null;

  const [camping, stats] = await Promise.all([
    getCampingById(campingId),
    getCampingStats(campingId),
  ]);

  if (!camping) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Hola, {camping.name}</h1>
      <p className="mt-1 text-gray-600">
        Estado:{" "}
        <span
          className={`font-medium ${
            camping.status === "active"
              ? "text-brand-green"
              : camping.status === "pending"
                ? "text-brand-accent"
                : "text-red-600"
          }`}
        >
          {statusLabels[camping.status]}
        </span>
      </p>

      {camping.status === "pending" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tu camping está en revisión. Cuando el equipo lo active, podrás publicar
          ofertas visibles en la web.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ofertas" value={stats.offers} />
        <StatCard label="Ofertas activas" value={stats.activeOffers} />
        <StatCard label="Ventas pagadas" value={stats.paidSales} />
        <StatCard label="Ingresos" value={`${stats.revenue} €`} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/camping/fotos" className="rounded-lg bg-brand-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-forest-dark">
          Subir fotografías
        </Link>
        <Link href="/camping/ofertas/nueva" className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">
          Nueva oferta
        </Link>
        <Link href="/camping/ventas" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Ver ventas
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-forest">{value}</p>
    </div>
  );
}
