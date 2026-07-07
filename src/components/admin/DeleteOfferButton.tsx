"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteOfferButtonProps = {
  offerId: string;
  offerTitle: string;
  apiPath?: string;
};

export default function DeleteOfferButton({
  offerId,
  offerTitle,
  apiPath = `/api/admin/offers/${offerId}`,
}: DeleteOfferButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `¿Eliminar la oferta «${offerTitle}»? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setLoading(true);
    const res = await fetch(apiPath, { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      alert("No se pudo eliminar la oferta");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-60"
    >
      {loading ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
