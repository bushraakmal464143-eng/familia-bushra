"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatMaxImageSizeLabel } from "@/lib/image-upload-limits";

type CustomerProfileFormProps = {
  name: string;
  email: string;
  avatarUrl?: string;
};

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CustomerProfileForm({
  name: initialName,
  email,
  avatarUrl: initialAvatar,
}: CustomerProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const displaySrc = preview || avatarUrl;
  const initials = initialsFrom(name || initialName);

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/cuenta/avatar", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setPreview(null);
        setError(data.error ?? "No se pudo subir la foto.");
        return;
      }
      if (data.url) setAvatarUrl(data.url);
      setPreview(null);
      setMessage("Foto de perfil actualizada.");
      router.refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/cuenta/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo guardar el perfil.");
      return;
    }

    setMessage("Perfil guardado correctamente.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="relative">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-brand-forest text-2xl font-bold text-white ring-4 ring-brand-cream">
            {displaySrc ? (
              <Image
                src={displaySrc}
                alt="Foto de perfil"
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={displaySrc.startsWith("blob:")}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {initials || "?"}
              </span>
            )}
          </div>
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs font-medium text-white">
              Subiendo…
            </span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-medium text-gray-900">Foto de perfil</p>
          <p className="mt-0.5 text-xs text-gray-500">
            JPG, PNG o WebP · {formatMaxImageSizeLabel()}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleAvatarChange(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : "Cambiar foto"}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="profile-name"
          className="text-sm font-medium text-gray-700"
        >
          Nombre de usuario
        </label>
        <input
          id="profile-name"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          minLength={2}
          maxLength={80}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
          value={email}
          disabled
          readOnly
        />
        <p className="mt-1 text-xs text-gray-500">
          El email no se puede cambiar desde aquí.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving || name.trim() === initialName.trim()}
        className="w-full rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar nombre"}
      </button>
    </form>
  );
}
