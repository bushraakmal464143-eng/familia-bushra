"use client";

import Image from "next/image";
import { useState } from "react";
import {
  createEmptyAccommodationUnit,
  sanitizeOfferAccommodations,
} from "@/lib/offer-accommodation-units";
import { MAX_IMAGE_BYTES } from "@/lib/image-upload-limits";
import type { OfferAccommodationUnit } from "@/lib/types";

type OfferAccommodationsEditorProps = {
  units: OfferAccommodationUnit[];
  onChange: (units: OfferAccommodationUnit[]) => void;
  defaultImage: string;
  defaultPrice: number;
  uploadUrl?: string;
};

export default function OfferAccommodationsEditor({
  units,
  onChange,
  defaultImage,
  defaultPrice,
  uploadUrl = "/api/admin/offers/upload",
}: OfferAccommodationsEditorProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateUnit(id: string, patch: Partial<OfferAccommodationUnit>) {
    onChange(units.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function removeUnit(id: string) {
    onChange(units.filter((u) => u.id !== id));
  }

  function addUnit() {
    onChange([
      ...units,
      createEmptyAccommodationUnit({
        image: defaultImage,
        pricePerPerson: defaultPrice,
      }),
    ]);
  }

  async function uploadImage(unitId: string, file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      setError("La imagen supera el tamaño máximo permitido.");
      return;
    }

    setError(null);
    setUploadingId(unitId);
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(uploadUrl, { method: "POST", body: form });
    setUploadingId(null);

    if (!res.ok) {
      setError("No se pudo subir la imagen.");
      return;
    }

    const data = (await res.json()) as { url?: string };
    if (data.url) updateUnit(unitId, { image: data.url });
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Alojamientos / bungalows
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Define los bungalows, chalets o parcelas que el cliente puede elegir
            al reservar esta oferta. Si no añades ninguno, se generarán
            automáticamente al reservar.
          </p>
        </div>
        <button
          type="button"
          onClick={addUnit}
          className="rounded-lg border border-brand-green bg-white px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-green/5"
        >
          + Añadir alojamiento
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {units.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
          Todavía no hay alojamientos configurados. Pulsa «Añadir alojamiento»
          para crear el primero.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {units.map((unit, index) => (
            <article
              key={unit.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Alojamiento {index + 1}
                  {!unit.enabled && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Oculto
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => removeUnit(unit.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nombre</label>
                  <input
                    className={inputClass}
                    value={unit.name}
                    onChange={(e) => updateUnit(unit.id, { name: e.target.value })}
                    placeholder="Ej. Chalet Portland, Bungalow Familiar…"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Descripción breve</label>
                  <textarea
                    className={`${inputClass} min-h-[72px]`}
                    value={unit.infoText}
                    onChange={(e) =>
                      updateUnit(unit.id, { infoText: e.target.value })
                    }
                    placeholder="Equipamiento, terraza, vistas…"
                  />
                </div>

                <div>
                  <label className={labelClass}>Precio (€/persona)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={unit.pricePerPerson}
                    onChange={(e) =>
                      updateUnit(unit.id, {
                        pricePerPerson: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Capacidad máxima (personas)</label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={unit.maxGuests}
                    onChange={(e) =>
                      updateUnit(unit.id, {
                        maxGuests: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Habitaciones disponibles</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={unit.roomsLeft ?? ""}
                    onChange={(e) =>
                      updateUnit(unit.id, {
                        roomsLeft:
                          e.target.value === ""
                            ? undefined
                            : Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    placeholder="Opcional"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Imagen</label>
                  <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {unit.image ? (
                        <Image
                          src={unit.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        className={inputClass}
                        value={unit.image}
                        onChange={(e) =>
                          updateUnit(unit.id, { image: e.target.value })
                        }
                        placeholder="/offers/… o URL"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-brand-green">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={uploadingId === unit.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadImage(unit.id, file);
                            e.target.value = "";
                          }}
                        />
                        {uploadingId === unit.id
                          ? "Subiendo imagen…"
                          : "Subir imagen"}
                      </label>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={unit.refundable}
                    onChange={(e) =>
                      updateUnit(unit.id, { refundable: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  Cancelación flexible (reembolsable)
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={unit.enabled}
                    onChange={(e) =>
                      updateUnit(unit.id, { enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  Visible en la reserva
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function validateOfferAccommodations(
  units: OfferAccommodationUnit[]
): string | null {
  if (units.length === 0) return null;

  for (const unit of units) {
    const name = unit.name.trim();
    if (!name && unit.enabled) {
      return "Cada alojamiento activo necesita un nombre.";
    }
    if (!name && (unit.infoText.trim() || unit.pricePerPerson > 0)) {
      return "Completa el nombre de cada alojamiento o elimínalo.";
    }
    if (name && unit.enabled && !(unit.pricePerPerson > 0)) {
      return `Indica un precio válido para «${name}».`;
    }
  }

  const enabled = units.filter((u) => u.enabled && u.name.trim());
  if (units.some((u) => u.enabled) && enabled.length === 0) {
    return "Activa al menos un alojamiento con nombre.";
  }

  return null;
}
