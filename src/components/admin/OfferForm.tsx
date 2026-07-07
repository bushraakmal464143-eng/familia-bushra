"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OfferGalleryUpload from "@/components/admin/OfferGalleryUpload";
import OfferAccommodationsEditor, {
  validateOfferAccommodations,
} from "@/components/admin/OfferAccommodationsEditor";
import MapLocationPicker from "@/components/admin/MapLocationPicker";
import { MAX_OFFER_IMAGES } from "@/lib/image-upload-limits";
import { sanitizeOfferAccommodations } from "@/lib/offer-accommodation-units";
import type { OfferCategory } from "@/lib/offers";
import type { OfferAccommodationUnit, OfferRecord, OfferStatus } from "@/lib/types";

const categories: { value: Exclude<OfferCategory, "all">; label: string }[] = [
  { value: "new", label: "Novedades" },
  { value: "bestseller", label: "Más vendidos" },
  { value: "coming", label: "Próximamente" },
];

type OfferFormProps = {
  offer?: OfferRecord;
  mode: "create" | "edit";
  campings: { id: string; name: string }[];
};

function highlightsToText(highlights: string[]) {
  return highlights.join("\n");
}

function textToHighlights(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function OfferForm({ offer, mode, campings }: OfferFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialImages = (() => {
    const defaults = [
      "/offers/montana-1.svg",
      "/offers/montana-2.svg",
      "/offers/montana-3.svg",
      "/offers/montana-4.svg",
      "/offers/montana-5.svg",
    ];
    const raw = [offer?.image, ...(offer?.gallery ?? [])].filter(Boolean) as string[];
    const unique = raw.filter((src, idx) => raw.indexOf(src) === idx);
    // New offers start with 5 placeholders; existing keep their images.
    return unique.length > 0 ? unique.slice(0, MAX_OFFER_IMAGES) : defaults;
  })();

  const [title, setTitle] = useState(offer?.title ?? "");
  const [subtitle, setSubtitle] = useState(offer?.subtitle ?? "");
  const [location, setLocation] = useState(offer?.location ?? "");
  const [region, setRegion] = useState(offer?.region ?? "");
  const [mealPlan, setMealPlan] = useState(offer?.mealPlan ?? "");
  const [highlights, setHighlights] = useState(
    highlightsToText(offer?.highlights ?? [])
  );
  const [description, setDescription] = useState(offer?.description ?? "");
  const [travelDates, setTravelDates] = useState(offer?.travelDates ?? "");
  const [priceFrom, setPriceFrom] = useState(String(offer?.priceFrom ?? 0));
  const [images, setImages] = useState<string[]>(initialImages);
  const [badge, setBadge] = useState(offer?.badge ?? "");
  const [countdown, setCountdown] = useState(offer?.countdown ?? "");
  const [countdownProgress, setCountdownProgress] = useState(
    offer?.countdownProgress != null ? String(offer.countdownProgress) : "75"
  );
  const [nightsOptionsText, setNightsOptionsText] = useState(
    offer?.nightsOptions?.length ? offer.nightsOptions.join(", ") : "1, 2, 3, 4, 5"
  );
  const [ctaText, setCtaText] = useState(
    offer?.ctaText ?? "Ver fechas desde {price} €/persona"
  );
  const [accommodationName, setAccommodationName] = useState(
    offer?.accommodationName ?? ""
  );
  const [accommodationLinkText, setAccommodationLinkText] = useState(
    offer?.accommodationLinkText ?? "Ver alojamiento →"
  );
  const [mapLabel, setMapLabel] = useState(offer?.mapLabel ?? "");
  const [mapLat, setMapLat] = useState(
    offer?.mapLat != null ? String(offer.mapLat) : ""
  );
  const [mapLng, setMapLng] = useState(
    offer?.mapLng != null ? String(offer.mapLng) : ""
  );
  const [campingId, setCampingId] = useState(
    offer?.campingId ?? campings[0]?.id ?? ""
  );
  const [category, setCategory] = useState(
    offer?.category ?? "new"
  );
  const [status, setStatus] = useState<OfferStatus>(offer?.status ?? "active");
  const [featured, setFeatured] = useState(offer?.featured ?? false);
  const [accommodations, setAccommodations] = useState<OfferAccommodationUnit[]>(
    offer?.accommodations ?? []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const cleanedImages = images.map((s) => s.trim()).filter(Boolean);
    const unique = cleanedImages.filter((src, idx) => cleanedImages.indexOf(src) === idx);
    if (unique.length < 5) {
      setSaving(false);
      setError("Por favor, sube al menos 5 imágenes distintas para la oferta.");
      return;
    }
    const mainImage = unique[0] ?? "/offers/cabin-style.png";
    const gallery = unique.slice(1, MAX_OFFER_IMAGES);

    const nightsOptions = nightsOptionsText
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
      .map((n) => Math.floor(n))
      .filter((n, idx, arr) => arr.indexOf(n) === idx)
      .slice(0, 12);
    if (nightsOptions.length === 0) {
      setSaving(false);
      setError("Define al menos una opción válida de noches (por ejemplo: 1,2,3).");
      return;
    }

    const progressNum = Number(countdownProgress);
    const progress =
      Number.isFinite(progressNum) ? Math.max(0, Math.min(100, progressNum)) : 75;

    const accommodationError = validateOfferAccommodations(accommodations);
    if (accommodationError) {
      setSaving(false);
      setError(accommodationError);
      return;
    }

    const parsedMapLat = mapLat.trim() ? Number(mapLat) : undefined;
    const parsedMapLng = mapLng.trim() ? Number(mapLng) : undefined;
    if (mapLat.trim() && !Number.isFinite(parsedMapLat)) {
      setSaving(false);
      setError("La latitud del mapa no es válida.");
      return;
    }
    if (mapLng.trim() && !Number.isFinite(parsedMapLng)) {
      setSaving(false);
      setError("La longitud del mapa no es válida.");
      return;
    }
    if (
      (parsedMapLat != null && (parsedMapLat < -90 || parsedMapLat > 90)) ||
      (parsedMapLng != null && (parsedMapLng < -180 || parsedMapLng > 180))
    ) {
      setSaving(false);
      setError("Las coordenadas del mapa están fuera de rango.");
      return;
    }
    if ((parsedMapLat == null) !== (parsedMapLng == null)) {
      setSaving(false);
      setError("Indica latitud y longitud, o deja ambas vacías.");
      return;
    }

    const sanitizedAccommodations = sanitizeOfferAccommodations(accommodations, {
      priceFrom: Number(priceFrom) || 0,
      image: mainImage,
    });

    const payload = {
      title,
      subtitle,
      location,
      region,
      mealPlan: mealPlan || undefined,
      highlights: textToHighlights(highlights),
      description,
      travelDates,
      priceFrom: Number(priceFrom),
      image: mainImage,
      gallery: gallery.length > 0 ? gallery : undefined,
      badge: badge || undefined,
      countdown: countdown || undefined,
      countdownProgress: countdown ? progress : undefined,
      nightsOptions,
      ctaText: ctaText.trim() || undefined,
      accommodationName: accommodationName.trim() || undefined,
      accommodationLinkText: accommodationLinkText.trim() || undefined,
      accommodations: sanitizedAccommodations,
      mapLabel: mapLabel.trim() || undefined,
      mapLat: parsedMapLat,
      mapLng: parsedMapLng,
      campingId,
      category,
      status,
      featured,
    };

    const url =
      mode === "create"
        ? "/api/admin/offers"
        : `/api/admin/offers/${offer!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

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

    router.push("/admin/offers");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Título</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Subtítulo</label>
          <input
            className={inputClass}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Localidad</label>
          <input
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Región</label>
          <input
            className={inputClass}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Precio desde (€/pers.)</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Camping</label>
          <select
            className={inputClass}
            value={campingId}
            onChange={(e) => setCampingId(e.target.value)}
            required
          >
            {campings.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as OfferStatus)}
          >
            <option value="active">Activa</option>
            <option value="draft">Borrador</option>
            <option value="inactive">Inactiva</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Categoría</label>
          <select
            className={inputClass}
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as Exclude<OfferCategory, "all">)
            }
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Imágenes de la oferta (mín. 5, máx. {MAX_OFFER_IMAGES})
          </label>
          <div className="mt-3">
            <OfferGalleryUpload
              images={images}
              onChange={setImages}
              uploadUrl="/api/admin/offers/upload"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Etiqueta (badge)</label>
          <input
            className={inputClass}
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Cuenta atrás</label>
          <input
            className={inputClass}
            value={countdown}
            onChange={(e) => setCountdown(e.target.value)}
            placeholder="Quedan 5 días"
          />
        </div>
        <div>
          <label className={labelClass}>Progreso cuenta atrás (0–100)</label>
          <input
            type="number"
            min="0"
            max="100"
            className={inputClass}
            value={countdownProgress}
            onChange={(e) => setCountdownProgress(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Opciones de noches (separadas por coma)</label>
          <input
            className={inputClass}
            value={nightsOptionsText}
            onChange={(e) => setNightsOptionsText(e.target.value)}
            placeholder="1, 2, 3, 4, 5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Texto del botón CTA (usa {"{price}"} para el precio)</label>
          <input
            className={inputClass}
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="Ver fechas desde {price} €/persona"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Nombre del alojamiento (opcional)</label>
          <input
            className={inputClass}
            value={accommodationName}
            onChange={(e) => setAccommodationName(e.target.value)}
            placeholder="Si lo dejas vacío, usamos el nombre del camping"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Texto del enlace de alojamiento</label>
          <input
            className={inputClass}
            value={accommodationLinkText}
            onChange={(e) => setAccommodationLinkText(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <OfferAccommodationsEditor
            units={accommodations}
            onChange={setAccommodations}
            defaultImage={images[0] ?? "/offers/cabin-style.png"}
            defaultPrice={Number(priceFrom) || 0}
          />
        </div>
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50/60 p-5">
          <h2 className="text-base font-bold text-gray-900">Ubicación en el mapa</h2>
          <p className="mt-1 text-sm text-gray-600">
            Busca el lugar como en Google Maps y selecciónalo de la lista.
          </p>
          <div className="mt-4">
            <MapLocationPicker
              mapLabel={mapLabel}
              mapLat={mapLat}
              mapLng={mapLng}
              location={location}
              region={region}
              onMapLabelChange={setMapLabel}
              onMapLatChange={setMapLat}
              onMapLngChange={setMapLng}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Régimen / comidas</label>
          <input
            className={inputClass}
            value={mealPlan}
            onChange={(e) => setMealPlan(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Fechas de viaje</label>
          <input
            className={inputClass}
            value={travelDates}
            onChange={(e) => setTravelDates(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Destacados (uno por línea)</label>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
          />
          <label htmlFor="featured" className="text-sm text-gray-700">
            Oferta destacada en la home
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : mode === "create" ? "Crear oferta" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
