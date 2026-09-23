"use client";

import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import {
  addDays,
  eachDayOfInterval,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Booking } from "@/lib/types";

export type CustomerCalendarBooking = {
  id: string;
  offerTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: Booking["status"];
  totalAmount: number;
  accommodationName?: string;
};

type CustomerBookingsCalendarProps = {
  bookings: CustomerCalendarBooking[];
};

const statusLabels: Record<Booking["status"], string> = {
  pending: "Pendiente de pago",
  paid: "Pagada",
  cancelled: "Cancelada",
};

function nightsForBooking(checkIn: string, checkOut: string): string[] {
  const start = startOfDay(parseISO(checkIn));
  const end = startOfDay(parseISO(checkOut));
  if (!isBefore(start, end)) return [format(start, "yyyy-MM-dd")];
  return eachDayOfInterval({ start, end: addDays(end, -1) }).map((d) =>
    format(d, "yyyy-MM-dd")
  );
}

export default function CustomerBookingsCalendar({
  bookings,
}: CustomerBookingsCalendarProps) {
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled"),
    [bookings]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, CustomerCalendarBooking[]>();
    for (const booking of activeBookings) {
      for (const day of nightsForBooking(booking.checkIn, booking.checkOut)) {
        const list = map.get(day) ?? [];
        list.push(booking);
        map.set(day, list);
      }
    }
    return map;
  }, [activeBookings]);

  const reservedDates = useMemo(
    () => [...byDate.keys()].map((key) => parseISO(key)),
    [byDate]
  );

  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const selectedKey = selected
    ? format(startOfDay(selected), "yyyy-MM-dd")
    : null;
  const dayBookings = selectedKey ? (byDate.get(selectedKey) ?? []) : [];
  const hasReservation = selectedKey ? byDate.has(selectedKey) : false;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">Mi calendario</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fechas con tus reservas (naranja) y fechas libres para ti.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brand-accent" />
              Con reserva
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
              Sin reserva
            </span>
          </div>

          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={es}
            showOutsideDays
            modifiers={{ reserved: reservedDates }}
            modifiersClassNames={{
              reserved: "admin-cal-booked",
            }}
            className="admin-bookings-calendar !mx-0 w-full text-gray-900"
          />
        </div>

        <div className="border-t border-gray-100 bg-gray-50/60 p-5 lg:border-l lg:border-t-0">
          {!selected && (
            <p className="text-sm text-gray-600">
              Elige una fecha para ver si tienes reserva ese día.
            </p>
          )}

          {selected && (
            <>
              <p className="text-sm font-semibold text-gray-900">
                {format(selected, "EEEE d MMMM yyyy", { locale: es })}
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  hasReservation ? "text-brand-accent" : "text-emerald-700"
                }`}
              >
                {hasReservation
                  ? `${dayBookings.length} reserva${dayBookings.length === 1 ? "" : "s"}`
                  : "Sin reserva — fecha libre"}
              </p>

              {hasReservation ? (
                <ul className="mt-4 space-y-3">
                  {dayBookings.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
                    >
                      <p className="font-medium text-gray-900">{b.offerTitle}</p>
                      {b.accommodationName && (
                        <p className="text-xs text-gray-500">
                          {b.accommodationName}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-600">
                        {b.checkIn} → {b.checkOut} · {b.guests} pers. ·{" "}
                        {statusLabels[b.status]}
                      </p>
                      <p className="mt-1 font-semibold text-brand-accent">
                        {b.totalAmount} €
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  No tienes ninguna reserva en esta fecha.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
