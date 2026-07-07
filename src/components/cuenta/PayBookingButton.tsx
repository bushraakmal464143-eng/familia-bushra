"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch(`/api/cuenta/bookings/${bookingId}/pay`, {
      method: "POST",
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("No se pudo procesar el pago");
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="rounded-md bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
    >
      {loading ? "Procesando…" : "Pagar ahora"}
    </button>
  );
}
