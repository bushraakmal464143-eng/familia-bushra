"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DayPicker, type DateRange, type DayButtonProps } from "react-day-picker";
import { format, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import {
  calculateStayPricing,
  getOfferDatePrice,
  getOfferMonthTabs,
} from "@/lib/offer-date-prices";
import { type AccommodationBookingDraft } from "@/components/AccommodationPicker";
import type { OfferRecord } from "@/lib/types";

type OfferBookingPanelProps = {
  offer: OfferRecord;
  customerId: string | null;
  ctaText: string;
  countdown?: string;
  countdownProgress: number;
  onDatesConfirmed: (draft: AccommodationBookingDraft) => void;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function travelersLabel(
  adults: number,
  children: number,
  childAges: (number | null)[]
): string {
  if (children > 0) {
    const agesComplete =
      childAges.length === children &&
      childAges.every((age) => age !== null && age >= 0);
    const base = `${adults} adulto${adults === 1 ? "" : "s"}, ${children} niño${children === 1 ? "" : "s"}`;
    if (agesComplete) {
      const agesText = childAges
        .map((age) => `${age} ${age === 1 ? "año" : "años"}`)
        .join(", ");
      return `${base} (${agesText})`;
    }
    return `${base} — indica la edad de cada uno`;
  }
  return `${adults} adulto${adults === 1 ? "" : "s"}`;
}

export default function OfferBookingPanel({
  offer,
  customerId,
  ctaText,
  countdown,
  countdownProgress,
  onDatesConfirmed,
}: OfferBookingPanelProps) {
  const router = useRouter();
  const monthTabs = useMemo(() => getOfferMonthTabs(offer), [offer]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(monthTabs[0]?.month ?? new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [modifyOpen, setModifyOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<(number | null)[]>([]);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stayPricing =
    dateRange?.from && dateRange?.to
      ? calculateStayPricing(offer, dateRange.from, dateRange.to)
      : null;

  const guests = adults + children;

  const checkIn = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const checkOut = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";
  const nights = stayPricing?.nights ?? 0;

  const childAgesValid =
    children === 0 ||
    (childAges.length === children &&
      childAges.every((age) => age !== null && age >= 0 && age <= 17));

  function handleChildrenChange(next: number) {
    const clamped = Math.max(0, Math.min(20 - adults, next));
    setChildren(clamped);
    setAgeError(null);
    if (clamped > 0) setModifyOpen(true);
    setChildAges((prev) => {
      if (clamped > prev.length) {
        return [...prev, ...Array(clamped - prev.length).fill(null)];
      }
      return prev.slice(0, clamped);
    });
  }

  function handleChildAge(index: number, age: number | null) {
    setAgeError(null);
    setChildAges((prev) => {
      const next = [...prev];
      next[index] = age;
      return next;
    });
  }

  function handleTravelersDone() {
    if (children > 0 && !childAgesValid) {
      setAgeError("Indica la edad de cada niño antes de continuar.");
      return;
    }
    setAgeError(null);
    setModifyOpen(false);
  }

  function handleDateRangeSelect(range: DateRange | undefined) {
    setError(null);

    if (!range?.from) {
      setDateRange(range);
      return;
    }

    if (range.from && range.to) {
      const pricing = calculateStayPricing(offer, range.from, range.to);
      if (pricing.nights < 1) {
        setError("La fecha de salida debe ser posterior a la de entrada.");
        setDateRange({ from: range.from, to: undefined });
        return;
      }
      if (!pricing.allAvailable) {
        setError(
          "Algún día de tu selección no está disponible. Elige un rango distinto."
        );
        setDateRange({ from: range.from, to: undefined });
        return;
      }
    }

    setDateRange(range);
  }

  function handleContinue() {
    setError(null);

    if (!dateRange?.from || !dateRange?.to || !stayPricing?.allAvailable) {
      setError("Selecciona fecha de entrada y salida en el calendario.");
      return;
    }
    if (stayPricing.nights < 1) {
      setError("Debes reservar al menos 1 noche.");
      return;
    }
    if (!childAgesValid) {
      setError("Indica la edad de cada niño.");
      return;
    }

    if (!customerId) {
      router.push(`/cuenta/login?from=/ofertas/${offer.id}`);
      return;
    }

    onDatesConfirmed({
      checkIn,
      checkOut,
      nights: stayPricing.nights,
      adults,
      children,
      childAges: childAges.filter((a): a is number => a !== null),
      guests,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold text-gray-900">{offer.subtitle}</p>
            <p className="mt-1 text-sm text-gray-600">
              <span aria-hidden className="mr-1">
                📍
              </span>
              {offer.location}
            </p>
            {offer.mealPlan && (
              <p className="mt-1 text-sm text-gray-600">
                <span aria-hidden className="mr-1">
                  🍽️
                </span>
                {offer.mealPlan}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-brand-cream px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
              Desde
            </p>
            <p className="text-xl font-extrabold text-brand-accent">
              {offer.priceFrom}€
            </p>
            <p className="text-[11px] font-medium text-gray-600">/persona</p>
          </div>
        </div>

        {countdown && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-gray-700">{countdown}</p>
              <span className="text-[11px] font-semibold text-gray-600">
                {countdownProgress}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-brand-accent"
                style={{ width: `${countdownProgress}%` }}
              />
            </div>
          </div>
        )}

        {!showCalendar && (
          <>
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="mt-5 w-full rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
            >
              {ctaText}
            </button>
            <p className="mt-3 text-xs text-gray-500">
              Precio orientativo. Confirmarás fechas y personas en el siguiente paso.
            </p>
          </>
        )}
      </div>

      {showCalendar && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">
            Indica el número viajeros y fechas del viaje
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Viajeros</p>
                <p className="text-sm font-semibold text-gray-900">
                  {travelersLabel(adults, children, childAges)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModifyOpen((open) => !open)}
                className="text-sm font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900"
              >
                Modificar
              </button>
            </div>

            {modifyOpen && (
              <div className="border-t border-gray-200 px-4 py-4">
                <GuestRow
                  label="Adultos"
                  hint="Mayores de 18 años"
                  value={adults}
                  min={1}
                  max={20 - children}
                  onChange={(n) => {
                    setAdults(n);
                    if (n + children > 20) handleChildrenChange(20 - n);
                  }}
                />
                <GuestRow
                  label="Niños"
                  hint="Menores de 18 años"
                  value={children}
                  min={0}
                  max={20 - adults}
                  onChange={handleChildrenChange}
                />

                {children > 0 && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Edad de cada niño <span className="text-brand-accent">*</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Obligatorio: indica la edad de los {children} niño
                      {children === 1 ? "" : "s"} que viajan.
                    </p>
                    {Array.from({ length: children }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3"
                      >
                        <label
                          htmlFor={`child-age-${index}`}
                          className="text-sm text-gray-700"
                        >
                          Niño {index + 1}
                        </label>
                        <select
                          id={`child-age-${index}`}
                          required
                          value={childAges[index] ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            handleChildAge(
                              index,
                              raw === "" ? null : Number(raw)
                            );
                          }}
                          className={`rounded-lg border bg-white px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent ${
                            childAges[index] == null
                              ? "border-amber-400"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="" disabled>
                            Seleccionar edad
                          </option>
                          {Array.from({ length: 18 }).map((_, age) => (
                            <option key={age} value={age}>
                              {age} {age === 1 ? "año" : "años"}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {ageError && (
                      <p className="text-sm text-red-600">{ageError}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTravelersDone}
                  disabled={children > 0 && !childAgesValid}
                  className="mt-4 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Listo
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {monthTabs.map((tab) => {
              const isActive =
                tab.month.getMonth() === visibleMonth.getMonth() &&
                tab.month.getFullYear() === visibleMonth.getFullYear();
              return (
                <button
                  key={tab.month.toISOString()}
                  type="button"
                  onClick={() => setVisibleMonth(tab.month)}
                  className={`shrink-0 rounded-lg border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-gray-900 bg-white shadow-sm"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-sm font-semibold capitalize text-gray-900">
                    {tab.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-600">
                    desde {tab.fromPrice} €
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Elige la <strong>fecha de entrada</strong> y después la{" "}
            <strong>fecha de salida</strong> para reservar varias noches.
          </p>

          <div className="mt-4 offer-price-calendar">
            <DayPicker
              mode="range"
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              locale={es}
              disabled={(date) =>
                isBefore(date, startOfToday()) ||
                getOfferDatePrice(offer, date) == null
              }
              numberOfMonths={1}
              showOutsideDays
              className="offer-price-calendar !mx-0 w-full text-gray-900"
              components={{
                DayButton: (props) => (
                  <PriceDayButton {...props} offer={offer} />
                ),
              }}
            />
            {dateRange?.from && !dateRange?.to && (
              <p className="mt-2 text-center text-xs font-medium text-brand-accent">
                Ahora elige la fecha de salida
              </p>
            )}
          </div>

          {dateRange?.from && dateRange?.to && stayPricing && stayPricing.allAvailable && (
            <div className="mt-4 rounded-xl bg-brand-cream/60 px-4 py-3 text-sm text-gray-800">
              <p>
                <span className="font-semibold">
                  {format(dateRange.from, "d MMM yyyy", { locale: es })}
                </span>
                {" → "}
                <span className="font-semibold">
                  {format(dateRange.to, "d MMM yyyy", { locale: es })}
                </span>
                {" · "}
                {stayPricing.nights}{" "}
                {stayPricing.nights === 1 ? "noche" : "noches"}
                {" · "}
                {travelersLabel(adults, children, childAges)}
              </p>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleContinue}
            className="mt-5 w-full rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-50"
          >
            {customerId ? "Continuar" : "Iniciar sesión para reservar"}
          </button>

          <button
            type="button"
            onClick={() => setShowCalendar(false)}
            className="mt-3 w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Volver
          </button>
        </div>
      )}

      {!customerId && (
        <div className="rounded-2xl border border-brand-accent/30 bg-orange-50 p-6">
          <p className="text-sm text-gray-800">
            Inicia sesión para contratar y pagar esta oferta.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/cuenta/login?from=/ofertas/${offer.id}`}
              className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/cuenta/registro"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceDayButton({
  day,
  modifiers,
  offer,
  ...buttonProps
}: DayButtonProps & { offer: OfferRecord }) {
  const price = getOfferDatePrice(offer, day.date);
  const unavailable = modifiers.disabled || price == null;
  const inRange =
    modifiers.selected ||
    modifiers.range_start ||
    modifiers.range_end ||
    modifiers.range_middle;

  return (
    <button
      {...buttonProps}
      type="button"
      disabled={unavailable}
      className={`flex h-[52px] w-full flex-col items-center justify-center rounded-md text-center transition ${
        modifiers.range_start || modifiers.range_end || modifiers.selected
          ? "bg-brand-accent text-white"
          : modifiers.range_middle
            ? "bg-orange-100 text-gray-900"
            : unavailable
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-900 hover:bg-gray-100"
      }`}
    >
      <span className="text-sm font-medium leading-none">{day.date.getDate()}</span>
      {!unavailable && (
        <span
          className={`mt-1 text-[10px] font-semibold leading-none ${
            inRange && !modifiers.range_middle
              ? "text-white/90"
              : "text-brand-accent"
          }`}
        >
          {price} €
        </span>
      )}
    </button>
  );
}

function GuestRow({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <CounterButton
          label={`Quitar ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </CounterButton>
        <span className="w-6 text-center font-semibold text-gray-900">{value}</span>
        <CounterButton
          label={`Añadir ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </CounterButton>
      </div>
    </div>
  );
}

function CounterButton({
  children,
  disabled,
  onClick,
  label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg font-medium text-gray-700 transition hover:border-brand-accent hover:text-brand-accent disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
