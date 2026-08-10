"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApproveOfferButtonProps = {
  offerId: string;
  label?: string;
  reject?: boolean;
};

export default function ApproveOfferButton({
  offerId,
  label,
  reject = false,
}: ApproveOfferButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/admin/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: reject ? "inactive" : "active",
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`text-sm font-medium disabled:opacity-60 ${
        reject
          ? "text-red-600 hover:underline"
          : "text-brand-green hover:underline"
      }`}
    >
      {loading
        ? "…"
        : label ?? (reject ? "Rechazar" : "Aprobar")}
    </button>
  );
}
