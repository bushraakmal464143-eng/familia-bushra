import Link from "next/link";
import AdminCampingsSearchTable from "@/components/admin/AdminCampingsSearchTable";
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

function toCampingRows(
  campings: Awaited<ReturnType<typeof getAdminStats>>["campingsWithStats"]
) {
  return campings.map(
    ({
      id,
      name,
      email,
      location,
      region,
      status,
      profileComplete,
      offerCount,
      activeOffers,
      paidSales,
      revenue,
    }) => ({
      id,
      name,
      email,
      location,
      region,
      status,
      profileComplete,
      offerCount,
      activeOffers,
      paidSales,
      revenue,
    })
  );
}

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

      <div className="mt-6">
        <AdminCampingsSearchTable
          campings={toCampingRows(sorted)}
          showEmail
          emptyLabel="No hay campings con este filtro."
        />
      </div>
    </div>
  );
}
