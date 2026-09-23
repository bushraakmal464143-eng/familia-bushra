"use client";

import Link from "next/link";
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

export type AdminCalendarBooking = {
  id: string;
  customerName: string;
  customerEmail: string;
  campingName: string;
  offerTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending" | "paid" | "cancelled";
  totalAmount: number;
};

type AdminBookingsCalendarProps = {
  bookings: AdminCalendarBooking[];
};

const statusLabels = {
  pending: "Pending payment",
  paid: "Paid",
  cancelled: "Cancelled",
} as const;

function nightsForBooking(checkIn: string, checkOut: string): string[] {
  const start = startOfDay(parseISO(checkIn));
  const end = startOfDay(parseISO(checkOut));
  if (!isBefore(start, end)) return [format(start, "yyyy-MM-dd")];
  return eachDayOfInterval({ start, end: addDays(end, -1) }).map((d) =>
    format(d, "yyyy-MM-dd")
  );
}

export default function AdminBookingsCalendar({
  bookings,
}: AdminBookingsCalendarProps) {
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled"),
    [bookings]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, AdminCalendarBooking[]>();
    for (const booking of activeBookings) {
      for (const day of nightsForBooking(booking.checkIn, booking.checkOut)) {
        const list = map.get(day) ?? [];
        list.push(booking);
        map.set(day, list);
      }
    }
    return map;
  }, [activeBookings]);

  const bookedDates = useMemo(
    () => [...byDate.keys()].map((key) => parseISO(key)),
    [byDate]
  );

  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const selectedKey = selected ? format(startOfDay(selected), "yyyy-MM-dd") : null;
  const dayBookings = selectedKey ? (byDate.get(selectedKey) ?? []) : [];
  const hasBooking = selectedKey ? byDate.has(selectedKey) : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 text-gray-700">
            <span className="h-3 w-3 rounded-full bg-brand-accent" />
            Has bookings
          </span>
          <span className="inline-flex items-center gap-2 text-gray-700">
            <span className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
            No bookings
          </span>
        </div>

        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          locale={es}
          showOutsideDays
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked: "admin-cal-booked",
          }}
          className="admin-bookings-calendar !mx-0 w-full text-gray-900"
        />

        <p className="mt-4 text-xs text-gray-500">
          Click a date to see bookings for that night. Checkout day is not
          counted as occupied.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {!selected && (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-900">Select a date</p>
            <p className="mt-1 text-sm text-gray-500">
              Dates with bookings are highlighted in orange.
            </p>
          </div>
        )}

        {selected && (
          <>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(selected, "EEEE d MMMM yyyy", { locale: es })}
            </h2>
            <p
              className={`mt-1 text-sm font-medium ${
                hasBooking ? "text-brand-accent" : "text-emerald-700"
              }`}
            >
              {hasBooking
                ? `${dayBookings.length} booking${dayBookings.length === 1 ? "" : "s"}`
                : "No bookings on this date"}
            </p>

            {hasBooking ? (
              <ul className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto">
                {dayBookings.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-gray-100 bg-gray-50/80 p-3"
                  >
                    <p className="font-medium text-gray-900">{b.customerName}</p>
                    <p className="text-xs text-gray-500">{b.customerEmail}</p>
                    <p className="mt-2 text-sm text-gray-700">{b.offerTitle}</p>
                    <p className="text-xs text-gray-500">{b.campingName}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      {b.checkIn} → {b.checkOut} · {b.guests} guests ·{" "}
                      {statusLabels[b.status]} · {b.totalAmount} €
                    </p>
                    <Link
                      href={`/admin/clientes`}
                      className="mt-2 inline-block text-xs font-medium text-brand-accent hover:underline"
                    >
                      View customers →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                This date is free — no active bookings.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
