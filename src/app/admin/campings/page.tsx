import Link from "next/link";
import { getAdminStats } from "@/lib/stats";
import type { CampingStatus } from "@/lib/types";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const STATUS_FILTERS: { value: "" | CampingStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "active", label: "Activos" },
  { value: "suspended", label: "Suspendidos" },
];

export default async function AdminCampingsPage({ searchParams }: Props) {
  const { status: rawStatus } = await searchParams;
  const statusFilter =
    rawStatus === "pending" || rawStatus === "active" || rawStatus === "suspended"
      ? rawStatus
      : "";

  const { campingsWithStats, campingsByStatus, totalCampings } =
    await getAdminStats();

  const filtered = statusFilter
    ? campingsWithStats.filter((c) => c.status === statusFilter)
    : campingsWithStats;

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Campings</h1>
      <p className="mt-1 text-gray-600">
        {totalCampings} registrados · {campingsByStatus.active} activos ·{" "}
        {campingsByStatus.pending} pendientes
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const href = f.value
            ? `/admin/campings?status=${f.value}`
            : "/admin/campings";
          const active = statusFilter === f.value;
          return (
            <Link
              key={f.label}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-forest text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
              {f.value === "pending" ? ` (${campingsByStatus.pending})` : ""}
            </Link>
          );
        })}
      </div>

      {statusFilter === "pending" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Solicitudes de alta de campings. Abre el detalle para revisar la ficha y
          activar la cuenta.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Alta</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Ventas</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3">
                  {c.status}
                  {!c.profileComplete && (
                    <span className="ml-2 text-xs text-amber-700">
                      · ficha incompleta
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{c.paidSales}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/campings/${c.id}`}
                    className="font-medium text-brand-accent hover:underline"
                  >
                    Ver detalle →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="px-4 py-10 text-center text-gray-500">
            No hay campings con este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
