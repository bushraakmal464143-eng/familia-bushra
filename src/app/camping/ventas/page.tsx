import { getBookings } from "@/lib/bookings-store";
import { formatBookingStatus } from "@/lib/stats";
import { getSessionSubject } from "@/lib/role-session";
import { tr } from "date-fns/locale";

export default async function CampingVentasPage() {
  const campingID = await getSessionSubject("camping")
  if(!campingID) return null;
  const bookings = (await getBookings())
  .filter((b) => b.campingId === campingID)
  .sort((a,b) => b.createdAt.localeCompare(a.createdAt));

  const paid = bookings.filter((b) => b.status === "paid");

  return(
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ventas y reservas </h1>
      <p className="my-t text-gray-600">{paid.length} Ventas cobradas .{" "}{paid.reduce((s, b) => s + b.totalAmount, 0)}€ en total
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fechas</th>
                <th className="px-4 py-3 font-medium">Importe</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 align-middle">
                    <p className="font-medium text-gray-900">{b.customerName}</p>
                    <p className="text-xs text-gray-500">{b.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 align-middle text-gray-700">
                    <span className="whitespace-nowrap">{b.checkIn} → {b.checkOut}</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {b.guests} pers. · {b.nights} noches
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle font-medium text-gray-900">
                    {b.totalAmount} €
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        b.status === "paid"
                          ? "bg-green-100 text-brand-green"
                          : b.status === "pending"
                            ? "bg-orange-100 text-brand-accent"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {formatBookingStatus(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <p className="px-4 py-12 text-center text-gray-500">Sin reservas todavía.</p>
        )}
      </div>
    </div>
  );
}