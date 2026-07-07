"use client";

import Image from "next/image";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  calculateAccommodationTotal,
  type AccommodationOption,
} from "@/lib/offer-accommodations";
import type { OfferRecord } from "@/lib/types";

export type AccommodationBookingDraft = {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  childAges: number[];
  guests: number;
};

type AccommodationPickerProps = {
  offer: OfferRecord;
  draft: AccommodationBookingDraft;
  options: AccommodationOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
  loading?: boolean;
  error?: string | null;
};

function travelersSummary(draft: AccommodationBookingDraft): string {
  if (draft.children > 0) {
    return `${draft.adults} adultos, ${draft.children} niños`;
  }
  return `${draft.adults} adulto${draft.adults === 1 ? "" : "s"}`;
}

export default function AccommodationPicker({
  offer,
  draft,
  options,
  selectedId,
  onSelect,
  onBack,
  onContinue,
  loading = false,
  error = null,
}: AccommodationPickerProps) {
  const available = options.filter((o) => o.available);
  const unavailable = options.filter((o) => !o.available);
  const selected = options.find((o) => o.id === selectedId) ?? null;

  const checkInDate = parseISO(draft.checkIn);
  const checkOutDate = parseISO(draft.checkOut);
  const regime = offer.mealPlan?.trim() || "Solo alojamiento";

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">
        Elige tu alojamiento
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Selecciona el bungalow o chalet que prefieras para tu estancia.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {available.map((option) => (
            <AccommodationCard
              key={option.id}
              option={option}
              guests={draft.guests}
              nights={draft.nights}
              selected={selectedId === option.id}
              onSelect={() => onSelect(option.id)}
            />
          ))}

          {unavailable.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Alojamiento no disponible para estas fechas
              </h3>
              <div className="mt-3 space-y-3">
                {unavailable.map((option) => (
                  <AccommodationCard
                    key={option.id}
                    option={option}
                    guests={draft.guests}
                    nights={draft.nights}
                    selected={false}
                    onSelect={() => {}}
                    disabled
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Entrada</p>
                  <p className="font-semibold text-gray-900">
                    {format(checkInDate, "EEE, d MMM yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-gray-500">De 16:00 a 20:00 h.</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Salida</p>
                  <p className="font-semibold text-gray-900">
                    {format(checkOutDate, "EEE, d MMM yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-gray-500">Antes de las 11:00 h.</p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex justify-between gap-3">
                  <dt>Noches</dt>
                  <dd className="font-medium">{draft.nights}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Viajeros</dt>
                  <dd className="font-medium">{travelersSummary(draft)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Régimen</dt>
                  <dd className="text-right font-medium">{regime}</dd>
                </div>
                {selected && (
                  <div className="flex justify-between gap-3 border-t border-gray-100 pt-2">
                    <dt>Alojamiento</dt>
                    <dd className="text-right font-medium">1× {selected.name}</dd>
                  </div>
                )}
              </dl>

              {selected && !selected.refundable && (
                <p className="mt-4 text-xs leading-relaxed text-gray-600">
                  Condiciones de cancelación: tarifa no reembolsable. En caso de
                  cancelación se aplicará el 100% de gastos.
                </p>
              )}

            </div>

            {offer.badge && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-gray-800">
                {offer.badge}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={onContinue}
              disabled={!selected || loading}
              className="w-full rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Cargando…" : "Continuar"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Volver
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AccommodationCard({
  option,
  guests,
  nights,
  selected,
  onSelect,
  disabled = false,
}: {
  option: AccommodationOption;
  guests: number;
  nights: number;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const total = calculateAccommodationTotal(option, guests, nights);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
          : selected
            ? "border-brand-accent bg-orange-50/40 ring-2 ring-brand-accent/30"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-36">
          <Image
            src={option.image}
            alt=""
            fill
            className="object-cover"
            sizes="144px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">{option.name}</h3>
            {!disabled && (
              <span className="text-sm font-medium text-brand-accent underline-offset-2 hover:underline">
                Ver info
              </span>
            )}
          </div>

          {!disabled && option.roomsLeft != null && option.roomsLeft <= 2 && (
            <p className="mt-1 text-sm font-medium text-red-600">
              ¡Quedan {option.roomsLeft} habitación
              {option.roomsLeft === 1 ? "" : "es"} disponible
              {option.roomsLeft === 1 ? "" : "s"}!
            </p>
          )}

          {disabled && option.unavailableReason && (
            <p className="mt-1 text-sm text-gray-500">{option.unavailableReason}</p>
          )}

          {!disabled && (
            <>
              <p className="mt-2 text-sm text-gray-600">
                Hasta {option.maxGuests} personas · {guests} en tu reserva
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    {option.pricePerPerson} €/pers.
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    Total {total} €
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {option.refundable
                    ? "Cancelación flexible"
                    : "¡Tarifa no reembolsable!"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
