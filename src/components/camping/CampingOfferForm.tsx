"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import { inferDisplayPagesFromFlags } from "@/lib/offer-display-pages";
import type { OfferRecord, OfferSetting, OfferStatus } from "@/lib/types";

type CampingOfferFormProps = {
  offer?: OfferRecord;
  photos: string[];
};

const statusLabels: Record<"draft" | "pending", string> = {
  draft: "Borrador (solo tú lo ves)",
  pending: "Enviar para aprobación del admin",
};

export default function CampingOfferForm({ offer, photos }: CampingOfferFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(offer?.title ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [priceFrom, setPriceFrom] = useState(String(offer?.priceFrom ?? ""));
  const [travelDates, setTravelDates] = useState(offer?.travelDates ?? "");
  const [image, setImage] = useState(offer?.image ?? photos[0] ?? "/offers/cabin-style.png");
  const [status, setStatus] = useState<"draft" | "pending">(
    offer?.status === "draft" ? "draft" : "pending"
  );
  const [category] = useState(offer?.category ?? "new");
  const [setting, setSetting] = useState<OfferSetting>(
    offer?.setting === "beach" ? "beach" : "mountain"
  );
  const [petFriendly, setPetFriendly] = useState(offer?.petFriendly ?? false);
  const [isGlamping, setIsGlamping] = useState(offer?.isGlamping ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const displayPages = inferDisplayPagesFromFlags({
      setting,
      petFriendly,
      isGlamping,
      isHotel: false,
    });
    const payload = {
      title,
      description,
      priceFrom: Number(priceFrom),
      travelDates,
      image,
      status: status as OfferStatus,
      category,
      setting,
      isHotel: false,
      petFriendly,
      isGlamping,
      displayPages,
      highlights: offer?.highlights ?? [],
      subtitle: offer?.subtitle ?? title,
      location: offer?.location,
      region: offer?.region,
    };
    const url = offer ? `/api/camping/offers/${offer.id}` : "/api/camping/offers";
    const method = offer ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Error al guardar");
      return;
    }
    router.push("/camping/ofertas");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">
        Las ofertas no se publican automáticamente. Un administrador debe
        aprobarlas antes de que aparezcan en la web.
      </p>
      <div>
        <label className="text-sm font-medium text-gray-700">Título de la oferta</label>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea className={`${inputClass} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Precio (€/pers./noche)</label>
          <input type="number" min="1" className={inputClass} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Acción</label>
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "pending")}
          >
            <option value="pending">{statusLabels.pending}</option>
            <option value="draft">{statusLabels.draft}</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Entorno / página</label>
          <select
            className={inputClass}
            value={setting}
            onChange={(e) => setSetting(e.target.value as OfferSetting)}
          >
            <option value="mountain">Campings de montaña</option>
            <option value="beach">Campings de playa</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={petFriendly}
            onChange={(e) => setPetFriendly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
          />
          También en Campings con perros
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isGlamping}
            onChange={(e) => setIsGlamping(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
          />
          También en Glampings
        </label>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Fechas / disponibilidad</label>
        <input className={inputClass} value={travelDates} onChange={(e) => setTravelDates(e.target.value)} />
      </div>
      <ImageUploadField
        value={image}
        onChange={setImage}
        uploadUrl="/api/camping/offers/upload"
        label="Imagen principal"
      />
      {photos.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">
            O elegir de tus fotos del camping
          </label>
          <select className={inputClass} value={image} onChange={(e) => setImage(e.target.value)}>
            {photos.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}
      <button type="submit" disabled={saving} className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
        {saving
          ? "Guardando…"
          : status === "draft"
            ? "Guardar borrador"
            : "Enviar para aprobación"}
      </button>
    </form>
  );
}
