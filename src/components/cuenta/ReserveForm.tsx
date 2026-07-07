"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { OfferRecord } from "@/lib/types";

type ReserveFormProps = {
  offer: OfferRecord;
};

export default function ReserveForm({ offer }: ReserveFormProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const total = nights * guests * offer.priceFrom;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/cuenta/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId: offer.id, checkIn, checkOut, guests }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear la reserva");
      return;
    }
    const booking = (await res.json()) as { id: string };
    router.push(`/pago?booking=${booking.id}`);
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Contratar esta oferta</h2>
      <p className="mt-1 text-sm text-gray-600">
        Desde <strong>{offer.priceFrom} €</strong> por persona y noche
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Entrada</label>
          <input type="date" className={inputClass} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Salida</label>
          <input type="date" className={inputClass} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Personas</label>
          <input type="number" min={1} max={12} className={inputClass} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
        </div>
      </div>

      {nights > 0 && (
        <p className="mt-4 text-sm text-gray-700">
          {nights} noche(s) × {guests} persona(s) ={" "}
          <span className="text-xl font-bold text-brand-accent">{total} €</span>
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || nights < 1}
        className="mt-6 w-full rounded-lg bg-brand-accent py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Reservando…" : "Continuar al pago"}
      </button>
    </form>
  );
}
