"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PhotoManagerProps = {
  initialPhotos: string[];
};

export default function PhotoManager({ initialPhotos }: PhotoManagerProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/camping/photos", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Error al subir");
      return;
    }
    const data = (await res.json()) as { camping?: { photos: string[] } };
    if (data.camping?.photos) setPhotos(data.camping.photos);
    router.refresh();
  }

  async function removePhoto(photoUrl: string) {
    if (!confirm("¿Eliminar esta foto?")) return;
    const res = await fetch("/api/camping/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl }),
    });
    if (res.ok) {
      const data = (await res.json()) as { photos: string[] };
      setPhotos(data.photos);
      router.refresh();
    }
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer rounded-lg bg-brand-forest px-4 py-2 text-sm font-medium text-white hover:bg-brand-forest-dark">
        {uploading ? "Subiendo…" : "Subir fotografía"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((url) => (
          <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      {photos.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">Aún no has subido fotos de tu camping.</p>
      )}
    </div>
  );
}
