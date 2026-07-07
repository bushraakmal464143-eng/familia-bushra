"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PaymentCheckoutProps = {
  bookingId: string;
  totalAmount: number;
  status: string;
};

export default function PaymentCheckout({
  bookingId,
  totalAmount,
  status,
}: PaymentCheckoutProps) {
  const router = useRouter();
  const [showTotal, setShowTotal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!showTotal) {
      setShowTotal(true);
      return;
    }

    setError(null);
    setLoading(true);
    const res = await fetch(`/api/cuenta/bookings/${bookingId}/pay`, {
      method: "POST",
    });
    setLoading(false);

    if (res.ok) {
      router.refresh();
      return;
    }

    setError("No se pudo procesar el pago");
  }

  if (status !== "pending") {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-md bg-brand-green/10 px-5 py-2.5 text-sm font-semibold text-brand-green">
          Pago completado
        </span>
        <Link
          href="/cuenta"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Mis reservas
        </Link>
      </div>
    );
  }

  return (
    <>
      {showTotal && (
        <div className="mt-6 rounded-xl border border-brand-accent/30 bg-orange-50 px-5 py-4">
          <p className="text-sm font-medium text-gray-700">Total general</p>
          <p className="mt-1 text-3xl font-extrabold text-brand-accent">
            {totalAmount} €
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="rounded-md bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {loading
            ? "Procesando…"
            : showTotal
              ? `Confirmar pago de ${totalAmount} €`
              : "Pagar ahora"}
        </button>
        <Link
          href="/cuenta"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Mis reservas
        </Link>
      </div>
    </>
  );
}
