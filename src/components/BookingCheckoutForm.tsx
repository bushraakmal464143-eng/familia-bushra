"use client";

import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import type { AccommodationBookingDraft } from "@/components/AccommodationPicker";
import type { AccommodationOption } from "@/lib/offer-accommodations";
import type { OfferRecord, TravelerDetails } from "@/lib/types";

const TOURIST_TAX_PER_PERSON_PER_NIGHT = 1.98;

const COUNTRIES = [
  "España",
  "Portugal",
  "Francia",
  "Alemania",
  "Italia",
  "Reino Unido",
  "Países Bajos",
  "Bélgica",
  "Suiza",
  "Argentina",
  "México",
  "Colombia",
  "Chile",
  "Estados Unidos",
  "Pakistán",
  "Otro",
];

const PHONE_CODES = [
  { code: "+34", label: "🇪🇸 +34" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+39", label: "🇮🇹 +39" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+92", label: "🇵🇰 +92" },
  { code: "+52", label: "🇲🇽 +52" },
  { code: "+54", label: "🇦🇷 +54" },
];

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
};

type BookingCheckoutFormProps = {
  offer: OfferRecord;
  draft: AccommodationBookingDraft;
  accommodation: AccommodationOption;
  galleryImages: string[];
  customer: CustomerProfile | null;
  offerId: string;
  loading?: boolean;
  error?: string | null;
  onBack: () => void;
  onConfirm: (details: TravelerDetails) => void;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function travelersSummary(draft: AccommodationBookingDraft): string {
  if (draft.children > 0) {
    return `${draft.adults} adultos, ${draft.children} niños`;
  }
  return `${draft.adults} adulto${draft.adults === 1 ? "" : "s"}`;
}

export default function BookingCheckoutForm({
  offer,
  draft,
  accommodation,
  galleryImages,
  customer,
  offerId,
  loading = false,
  error = null,
  onBack,
  onConfirm,
}: BookingCheckoutFormProps) {
  const prefilled = useMemo(() => splitName(customer?.name ?? ""), [customer?.name]);

  const [firstName, setFirstName] = useState(prefilled.firstName);
  const [lastName, setLastName] = useState(prefilled.lastName);
  const [country, setCountry] = useState("España");
  const [documentId, setDocumentId] = useState("");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+34");
  const [phone, setPhone] = useState("");
  const [requestInvoice, setRequestInvoice] = useState(false);
  const [showRoomRequests, setShowRoomRequests] = useState(false);
  const [roomRequests, setRoomRequests] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const checkInDate = parseISO(draft.checkIn);
  const checkOutDate = parseISO(draft.checkOut);
  const regime = offer.mealPlan?.trim() || "Solo alojamiento";
  const touristTaxTotal =
    Math.round(
      draft.guests * draft.nights * TOURIST_TAX_PER_PERSON_PER_NIGHT * 100
    ) / 100;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!customer) {
      setFormError("Inicia sesión o crea una cuenta para confirmar la reserva.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setFormError("Indica el nombre y los apellidos del viajero principal.");
      return;
    }
    if (!documentId.trim()) {
      setFormError("Indica el documento de identidad del viajero principal.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Indica un correo electrónico válido.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Indica un teléfono de contacto.");
      return;
    }

    onConfirm({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country,
      documentId: documentId.trim(),
      email: email.trim(),
      phoneCountryCode,
      phone: phone.trim(),
      requestInvoice,
      roomRequests: roomRequests.trim() || undefined,
    });
  }

  const displayError = formError ?? error;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Finaliza tu reserva</h2>
      <p className="mt-1 text-sm text-gray-600">
        Completa los datos del viajero principal antes de confirmar.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <form className="space-y-6 lg:col-span-7" onSubmit={handleSubmit}>
          {!customer && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <Link
                href={`/cuenta/login?from=/ofertas/${offerId}`}
                className="font-semibold underline underline-offset-2"
              >
                Inicia sesión
              </Link>{" "}
              o{" "}
              <Link
                href={`/cuenta/registro?from=/ofertas/${offerId}`}
                className="font-semibold underline underline-offset-2"
              >
                crea una cuenta
              </Link>{" "}
              para reservar más rápido y gestionar tus reservas.
            </div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900">
              Introduce los datos del viajero principal
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-gray-700">Nombre</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  autoComplete="given-name"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-gray-700">Apellidos</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  autoComplete="family-name"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm">
              <span className="font-medium text-gray-700">País</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm">
              <span className="font-medium text-gray-700">Documento de identidad</span>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                autoComplete="off"
              />
            </label>

            <label className="mt-4 block text-sm">
              <span className="font-medium text-gray-700">Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                autoComplete="email"
              />
            </label>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Teléfono 1</span>
              <div className="mt-1 flex gap-2">
                <select
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  className="w-28 shrink-0 rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-900"
                >
                  {PHONE_CODES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  autoComplete="tel-national"
                />
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={requestInvoice}
                onChange={(e) => setRequestInvoice(e.target.checked)}
                className="mt-1"
              />
              <span>Me gustaría solicitar factura de esta reserva.</span>
            </label>

            <label className="mt-3 flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showRoomRequests}
                onChange={(e) => setShowRoomRequests(e.target.checked)}
                className="mt-1"
              />
              <span>Peticiones sobre tu habitación</span>
            </label>

            {showRoomRequests && (
              <textarea
                value={roomRequests}
                onChange={(e) => setRoomRequests(e.target.value)}
                rows={3}
                placeholder="Indica cualquier petición especial para tu estancia…"
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900">Tasa turística</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Esta tasa se abona directamente en el alojamiento y no está incluida
              en el importe de la reserva.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-3">
                <dt>Precio por persona y noche</dt>
                <dd className="font-medium">
                  {TOURIST_TAX_PER_PERSON_PER_NIGHT.toFixed(2)} €
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-gray-100 pt-2">
                <dt>Total estimado en alojamiento</dt>
                <dd className="font-semibold text-gray-900">
                  {touristTaxTotal.toFixed(2)} €
                </dd>
              </div>
            </dl>
          </section>

          {displayError && (
            <p className="text-sm text-red-600">{displayError}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Confirmando reserva…" : "Confirmar reserva"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Volver
            </button>
          </div>
        </form>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full bg-gray-100">
                <Image
                  src={galleryImages[0] ?? offer.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                {offer.badge && (
                  <span className="absolute left-3 top-3 rounded-md bg-brand-accent px-2 py-1 text-xs font-semibold text-white">
                    {offer.badge}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900">{offer.title}</h3>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Este viaje incluye
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                    {offer.highlights.slice(0, 5).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={accommodation.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {accommodation.name}
                  </p>
                </div>

                <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-700">
                  <div className="flex justify-between gap-3">
                    <dt>Entrada</dt>
                    <dd className="text-right font-medium">
                      {format(checkInDate, "EEE, d MMM yyyy", { locale: es })}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Salida</dt>
                    <dd className="text-right font-medium">
                      {format(checkOutDate, "EEE, d MMM yyyy", { locale: es })}
                    </dd>
                  </div>
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
                </dl>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
