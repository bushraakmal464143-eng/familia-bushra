"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  formatMaxImageSizeLabel,
  MAX_IMAGE_BYTES,
  MAX_OFFER_IMAGES,
} from "@/lib/image-upload-limits";

const DEFAULT_IMAGES = [
  "/offers/montana-1.svg",
  "/offers/montana-2.svg",
  "/offers/montana-3.svg",
  "/offers/montana-4.svg",
  "/offers/montana-5.svg",
];

type OfferGalleryUploadProps = {
  images: string[];
  onChange: (images: string[]) => void;
  uploadUrl: string;
};

function uniq(list: string[]) {
  return list.filter((src, idx) => list.indexOf(src) === idx);
}

export default function OfferGalleryUpload({
  images,
  onChange,
  uploadUrl,
}: OfferGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const safe = useMemo(() => {
    const cleaned = images.map((s) => s.trim()).filter(Boolean);
    return uniq(cleaned).slice(0, MAX_OFFER_IMAGES);
  }, [images]);

  const canUploadMore = safe.length < MAX_OFFER_IMAGES;
  const remaining = Math.max(0, MAX_OFFER_IMAGES - safe.length);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    if (safe.length + selected.length > MAX_OFFER_IMAGES) {
      setError(
        `Máximo ${MAX_OFFER_IMAGES} imágenes por oferta. Te quedan ${remaining}.`
      );
      return;
    }

    setError("");
    setUploading(true);

    try {
      const urls: string[] = [];
      const skipped: string[] = [];

      for (const file of selected) {
        if (safe.length + urls.length >= MAX_OFFER_IMAGES) {
          skipped.push(`${file.name}: límite de ${MAX_OFFER_IMAGES} imágenes alcanzado`);
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          skipped.push(`${file.name}: ${formatMaxImageSizeLabel()}`);
          continue;
        }

        const form = new FormData();
        form.append("file", file);
        const res = await fetch(uploadUrl, { method: "POST", body: form });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          skipped.push(`${file.name}: ${data.error ?? "error al subir"}`);
          continue;
        }
        urls.push(data.url);
      }

      if (urls.length === 0) {
        setError(
          skipped.length === 1
            ? skipped[0]
            : `No se pudo subir ninguna imagen. ${skipped.slice(0, 3).join(" · ")}`
        );
        return;
      }

      const next = uniq([...safe, ...urls]).slice(0, MAX_OFFER_IMAGES);
      onChange(next);

      if (skipped.length > 0) {
        setError(
          `${urls.length} imagen${urls.length === 1 ? "" : "es"} añadida${urls.length === 1 ? "" : "s"}. ` +
            `Omitidas: ${skipped.slice(0, 3).join(" · ")}` +
            (skipped.length > 3 ? ` (+${skipped.length - 3} más)` : "")
        );
      } else if (next.length !== safe.length + urls.length) {
        setError("Algunas imágenes repetidas se ignoraron (deben ser distintas).");
      }
    } catch {
      setError("Error al subir las imágenes");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    const next = safe.filter((_, i) => i !== index);
    onChange(next);
  }

  function makePrimary(index: number) {
    if (index <= 0) return;
    const next = [...safe];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  function useDefaults() {
    onChange(uniq([...DEFAULT_IMAGES, ...safe]).slice(0, MAX_OFFER_IMAGES));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700">
          {safe.length}/{MAX_OFFER_IMAGES} imágenes
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`inline-flex cursor-pointer rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 ${
              !canUploadMore || uploading ? "opacity-60" : ""
            }`}
          >
            {uploading
              ? "Subiendo…"
              : remaining >= 10
                ? "Añadir imágenes"
                : `Añadir (${remaining} restantes)`}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={!canUploadMore || uploading}
            />
          </label>
          <button
            type="button"
            onClick={useDefaults}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Añadir por defecto
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Puedes subir hasta {MAX_OFFER_IMAGES} fotos ({formatMaxImageSizeLabel()} cada una).
        La primera es la imagen principal (aparece en la tarjeta y en la galería).
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {safe.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
            Sube fotos para esta oferta.
          </div>
        )}

        {safe.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-2 py-1.5">
              <span className="text-[11px] font-semibold text-gray-600">
                {idx === 0 ? "Principal" : `#${idx + 1}`}
              </span>
              <div className="flex items-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(idx)}
                    className="text-[11px] font-medium text-brand-accent hover:underline"
                  >
                    Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="text-[11px] font-medium text-gray-500 hover:text-gray-700"
                >
                  Quitar
                </button>
              </div>
            </div>
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src={src}
                alt={`Imagen ${idx + 1}`}
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
