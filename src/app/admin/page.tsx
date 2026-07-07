import Link from "next/link";
import { getPartnerContacts } from "@/lib/partner-contacts-store";
import { getAdminStats } from "@/lib/stats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function AdminDashboardPage() {
  const [stats, partnerContacts] = await Promise.all([
    getAdminStats(),
    getPartnerContacts(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mi panel — Operaciones</h1>
      <p className="mt-1 text-gray-600">
        Visión global de campings, ofertas y ventas de la plataforma.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Contenido web"
          value="Editar"
          href="/admin/site"
          accent="orange"
        />
        <StatCard label="Campings totales" value={stats.totalCampings} href="/admin/campings" />
        <StatCard label="Campings activos" value={stats.campingsByStatus.active} accent="green" />
        <StatCard label="Pendientes de alta" value={stats.campingsByStatus.pending} accent="orange" />
        <StatCard label="Ofertas activas" value={stats.activeOffersCount} href="/admin/offers" />
        <StatCard label="Reservas pagadas" value={stats.paidBookings} />
        <StatCard label="Ingresos totales" value={`${stats.totalRevenue} €`} />
        <StatCard label="Todas las ofertas" value={stats.totalOffers} />
        <StatCard label="Reservas totales" value={stats.totalBookings} />
      </div>

      {stats.registrationsByMonth.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900">Altas por mes</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.registrationsByMonth.map(({ month, count }) => (
              <div
                key={month}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <span className="text-gray-500">{month}</span>
                <span className="ml-2 font-bold text-brand-forest">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {partnerContacts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900">
            Consultas de campings ({partnerContacts.length})
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Mensajes recibidos desde el formulario &quot;Más información&quot; de la web.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium">Camping</th>
                    <th className="px-4 py-3 font-medium">Teléfono</th>
                    <th className="px-4 py-3 font-medium">Mensaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partnerContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 align-top whitespace-nowrap text-gray-600">
                        {format(new Date(c.createdAt), "d MMM yyyy HH:mm", {
                          locale: es,
                        })}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <a
                          href={`mailto:${c.email}`}
                          className="text-xs text-brand-accent hover:underline"
                        >
                          {c.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {c.campingName}
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap text-gray-700">
                        {c.phone}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-600">
                        {c.message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Campings</h2>
          <Link href="/admin/campings" className="text-sm font-medium text-brand-accent hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Camping</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Ofertas</th>
                <th className="px-4 py-3">Ventas</th>
                <th className="px-4 py-3">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.campingsWithStats.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <Link href={`/admin/campings/${c.id}`} className="font-medium text-brand-forest hover:underline">
                      {c.name}
                    </Link>
                    <p className="text-xs text-gray-500">{c.location}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">{c.activeOffers} / {c.offerCount}</td>
                  <td className="px-4 py-3 font-medium">{c.paidSales}</td>
                  <td className="px-4 py-3">{c.revenue} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href?: string;
  accent?: "green" | "orange";
}) {
  const inner = (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          accent === "green"
            ? "text-brand-green"
            : accent === "orange"
              ? "text-brand-accent"
              : "text-brand-forest"
        }`}
      >
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-brand-green",
    pending: "bg-orange-100 text-brand-accent",
    suspended: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    active: "Activo",
    pending: "Pendiente",
    suspended: "Suspendido",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}
