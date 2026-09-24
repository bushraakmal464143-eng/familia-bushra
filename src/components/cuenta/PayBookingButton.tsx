"use client";

import { useState } from "react";

export default function PayBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cuenta/bookings/${bookingId}/pay`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        alert(data.error ?? "No se pudo iniciar el pago");
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("No se pudo iniciar el pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="rounded-md bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
    >
      {loading ? "Redirigiendo…" : "Pagar con Stripe"}
    </button>
  );
}
