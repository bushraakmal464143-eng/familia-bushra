"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled") === "1";

  useEffect(() => {
    if (!sessionId || status === "paid") return;

    let cancelledRequest = false;
    async function confirm() {
      setConfirming(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/cuenta/bookings/${bookingId}/confirm-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
          }
        );
        if (cancelledRequest) return;
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "No se pudo confirmar el pago.");
          return;
        }
        router.replace(`/pago?booking=${bookingId}`);
        router.refresh();
      } catch {
        if (!cancelledRequest) {
          setError("No se pudo confirmar el pago.");
        }
      } finally {
        if (!cancelledRequest) setConfirming(false);
      }
    }

    void confirm();
    return () => {
      cancelledRequest = true;
    };
  }, [sessionId, status, bookingId, router]);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cuenta/bookings/${bookingId}/pay`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago con Stripe.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No se pudo iniciar el pago con Stripe.");
    } finally {
      setLoading(false);
    }
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
      <div className="mt-6 rounded-xl border border-brand-accent/30 bg-orange-50 px-5 py-4">
        <p className="text-sm font-medium text-gray-700">Total a pagar</p>
        <p className="mt-1 text-3xl font-extrabold text-brand-accent">
          {totalAmount} €
        </p>
        <p className="mt-2 text-xs text-gray-600">
          Pago seguro con Stripe (modo test). Usa la tarjeta{" "}
          <span className="font-mono">4242 4242 4242 4242</span>.
        </p>
      </div>

      {cancelled && (
        <p className="mt-4 text-sm text-amber-800">
          Has cancelado el pago. Puedes intentarlo de nuevo cuando quieras.
        </p>
      )}

      {confirming && (
        <p className="mt-4 text-sm text-brand-forest">
          Confirmando pago con Stripe…
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePay}
          disabled={loading || confirming}
          className="rounded-md bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? "Redirigiendo a Stripe…" : `Pagar ${totalAmount} € con Stripe`}
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
