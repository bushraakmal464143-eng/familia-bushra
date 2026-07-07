"use client";

import Image from "next/image";
import { useState } from "react";
import { formatMaxImageSizeLabel, MAX_IMAGE_BYTES } from "@/lib/image-upload-limits";

type ImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  uploadUrl: string;
  label?: string;
};

export default function ImageUploadField({
  value,
  onChange,
  uploadUrl,
  label = "Imagen de la oferta",
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      setError(`${file.name}: ${formatMaxImageSizeLabel()}`);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Error al subir la imagen");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value && (
        <div className="relative mt-2 aspect-[16/10] max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <Image
            src={value}
            alt="Vista previa"
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700">
          {uploading ? "Subiendo…" : "Subir desde galería"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("/offers/cabin-style.png")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Usar imagen por defecto
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
