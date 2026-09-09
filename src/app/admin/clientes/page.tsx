import Link from "next/link";
import { getBookings } from "@/lib/bookings-store";
import { getCustomers, stripCustomerSecrets } from "@/lib/customers-store";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customers, bookings] = await Promise.all([
    getCustomers(),
    getBookings(),
  ]);

  const rows = customers
    .map((customer) => {
      const safe = stripCustomerSecrets(customer);
      const customerBookings = bookings.filter(
        (b) =>
          b.customerId === customer.id ||
          b.customerEmail.toLowerCase() === customer.email.toLowerCase()
      );
      const paid = customerBookings.filter((b) => b.status === "paid");
      const revenue = paid.reduce((sum, b) => sum + b.totalAmount, 0);
      return {
        ...safe,
        loginMethod: customer.googleId
          ? "Google"
          : customer.passwordHash
            ? "Email"
            : "—",
        bookingsCount: customerBookings.length,
        paidCount: paid.length,
        revenue,
      };
    })
    .sort((a, b) => {
      const aLogin = a.lastLoginAt ?? a.createdAt;
      const bLogin = b.lastLoginAt ?? b.createdAt;
      return bLogin.localeCompare(aLogin);
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-gray-600">
            Usuarios registrados y su último acceso.
          </p>
        </div>
        <Link
          href="/admin/accesos"
          className="text-sm font-medium text-brand-accent hover:underline"
        >
          Ver historial de accesos →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clientes registrados</p>
          <p className="mt-1 text-2xl font-bold text-brand-forest">
            {rows.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Con reservas</p>
          <p className="mt-1 text-2xl font-bold text-brand-accent">
            {rows.filter((r) => r.bookingsCount > 0).length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Login con Google</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">
            {rows.filter((r) => r.loginMethod === "Google").length}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-gray-600">
            Todavía no hay clientes registrados. Cuando alguien cree una cuenta
            o inicie sesión, aparecerá aquí.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Alta</th>
                  <th className="px-4 py-3 font-medium">Último acceso</th>
                  <th className="px-4 py-3 font-medium">Acceso</th>
                  <th className="px-4 py-3 font-medium">Reservas</th>
                  <th className="px-4 py-3 font-medium">Pagadas</th>
                  <th className="px-4 py-3 font-medium">Gastado</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-xs text-brand-accent hover:underline"
                      >
                        {customer.email}
                      </a>
                      <p className="mt-0.5 text-xs text-gray-400">{customer.id}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {format(new Date(customer.createdAt), "d MMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {customer.lastLoginAt
                        ? format(
                            new Date(customer.lastLoginAt),
                            "d MMM yyyy HH:mm",
                            { locale: es }
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{customer.loginMethod}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {customer.bookingsCount}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{customer.paidCount}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {customer.revenue} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clientes/${customer.id}`}
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
        )}
      </div>
    </div>
  );
}
