import Link from "next/link";
import { getAdminStats } from "@/lib/stats";

export default async function AdminCampingsPage() {
  const { campingsWithStats, campingsByStatus, totalCampings } =
    await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Campings</h1>
      <p className="mt-1 text-gray-600">
        {totalCampings} registrados · {campingsByStatus.active} activos ·{" "}
        {campingsByStatus.pending} pendientes
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
            {campingsWithStats.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3">{c.status}</td>
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
      </div>
    </div>
  );
}
