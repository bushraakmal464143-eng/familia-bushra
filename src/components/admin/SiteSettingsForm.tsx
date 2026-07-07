"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteSettings } from "@/lib/types";

type SiteSettingsFormProps = {
  initial: SiteSettings;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

const labelClass = "text-sm font-medium text-gray-700";

export default function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      setError("No se pudieron guardar los cambios.");
      return;
    }

    const data = (await res.json()) as SiteSettings;
    setForm(data);
    setMessage("Cambios publicados en la web.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Marca y logo</h2>
        <p className="mt-1 text-sm text-gray-600">
          Nombre del sitio, eslogan y texto del logo en la cabecera.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre del sitio</label>
            <input
              className={inputClass}
              value={form.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Eslogan</label>
            <input
              className={inputClass}
              value={form.siteTagline}
              onChange={(e) => update("siteTagline", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Logo — parte 1</label>
            <input
              className={inputClass}
              value={form.logoPart1}
              onChange={(e) => update("logoPart1", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Logo — acento</label>
            <input
              className={inputClass}
              value={form.logoAccent}
              onChange={(e) => update("logoAccent", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Logo — parte 2</label>
            <input
              className={inputClass}
              value={form.logoPart2}
              onChange={(e) => update("logoPart2", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Logo — sufijo</label>
            <input
              className={inputClass}
              value={form.logoSuffix}
              onChange={(e) => update("logoSuffix", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Página principal</h2>
        <p className="mt-1 text-sm text-gray-600">
          Título del banner, imagen de fondo y sección de ofertas.
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={labelClass}>Título principal (hero)</label>
            <input
              className={inputClass}
              value={form.heroTitle}
              onChange={(e) => update("heroTitle", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Subtítulo del hero</label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.heroSubtitle}
              onChange={(e) => update("heroSubtitle", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>URL imagen del hero</label>
            <input
              className={inputClass}
              value={form.heroImageUrl}
              onChange={(e) => update("heroImageUrl", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Título sección ofertas</label>
            <input
              className={inputClass}
              value={form.offersHeading}
              onChange={(e) => update("offersHeading", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Mensaje de confianza</label>
            <input
              className={inputClass}
              value={form.trustPoint}
              onChange={(e) => update("trustPoint", e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Pie de página y contacto</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Texto del footer</label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.footerText}
              onChange={(e) => update("footerText", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email de contacto</label>
            <input
              type="email"
              className={inputClass}
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Teléfono de contacto</label>
            <input
              className={inputClass}
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm font-medium text-brand-green" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Publicar cambios en la web"}
      </button>
    </form>
  );
}
