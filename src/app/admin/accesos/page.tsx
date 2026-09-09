import Link from "next/link";
import { getAuthEvents } from "@/lib/auth-events-store";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

const eventLabels = {
  signup: "Registro",
  login: "Login",
} as const;

const methodLabels = {
  email: "Email",
  google: "Google",
} as const;

export default async function AdminAuthEventsPage() {
  const events = await getAuthEvents(200);
  const signups = events.filter((e) => e.eventType === "signup").length;
  const logins = events.filter((e) => e.eventType === "login").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Accesos</h1>
      <p className="mt-1 text-gray-600">
        Historial de registros e inicios de sesión de clientes.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Eventos recientes</p>
          <p className="mt-1 text-2xl font-bold text-brand-forest">
            {events.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Registros</p>
          <p className="mt-1 text-2xl font-bold text-brand-accent">{signups}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Logins</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{logins}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {events.length === 0 ? (
          <p className="p-6 text-sm text-gray-600">
            Todavía no hay eventos. Cuando alguien se registre o inicie sesión,
            aparecerá aquí y también en la tabla{" "}
            <code className="rounded bg-gray-100 px-1">auth_events</code> de
            Supabase.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Evento</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {format(new Date(event.createdAt), "d MMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.eventType === "signup"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {eventLabels[event.eventType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {methodLabels[event.method]}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {event.name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500">{event.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {event.customerId ? (
                        <Link
                          href={`/admin/clientes/${event.customerId}`}
                          className="font-medium text-brand-accent hover:underline"
                        >
                          Ver →
                        </Link>
                      ) : null}
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
