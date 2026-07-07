"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import type { OfferRecord } from "@/lib/types";

type CampingOfferFormProps = {
  offer?: OfferRecord;
  photos: string[];
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
  const [status, setStatus] = useState(offer?.status ?? "active");
  const [category] = useState(offer?.category ?? "new");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title,
      description,
      priceFrom: Number(priceFrom),
      travelDates,
      image,
      status,
      category,
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
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as OfferRecord["status"])}>
            <option value="active">Activa</option>
            <option value="draft">Borrador</option>
            <option value="inactive">Inactiva</option>
          </select>
        </div>
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
        {saving ? "Guardando…" : offer ? "Guardar" : "Publicar oferta"}
      </button>
    </form>
  );
}
