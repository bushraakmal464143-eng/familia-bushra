"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Camping } from "@/lib/types";

type CampingProfileFormProps = {
  camping: Omit<Camping, "passwordHash">;
};

export default function CampingProfileForm({ camping }: CampingProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(camping.name);
  const [phone, setPhone] = useState(camping.phone ?? "");
  const [location, setLocation] = useState(camping.location);
  const [region, setRegion] = useState(camping.region);
  const [description, setDescription] = useState(camping.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/camping/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name,
        phone,
        location,
        region,
        description,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo guardar la ficha");
      return;
    }

    setMessage(
      "Ficha enviada. Cuando un administrador apruebe tu camping podrás publicar ofertas."
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <div>
        <label className="text-sm font-medium text-gray-700">Nombre del camping</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Camping Valle Verde"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Teléfono de contacto</label>
        <input
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej. 612 345 678"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Localidad</label>
          <input
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej. Benasque"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Región / provincia</label>
          <input
            className={inputClass}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ej. Huesca, Pirineos"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Descripción del camping
        </label>
        <textarea
          className={`${inputClass} min-h-[120px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cuéntanos servicios, entorno, tipo de parcelas o bungalows…"
          required
        />
      </div>

      <p className="text-sm text-gray-600">
        También puedes{" "}
        <Link href="/camping/fotos" className="font-medium text-brand-accent hover:underline">
          subir fotografías
        </Link>{" "}
        para que el equipo revise mejor tu solicitud.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving
          ? "Guardando…"
          : camping.profileComplete
            ? "Actualizar ficha"
            : "Enviar ficha para revisión"}
      </button>
    </form>
  );
}
