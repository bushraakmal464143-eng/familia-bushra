"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CampingStatus } from "@/lib/types";

const statusOptions: {
  value: CampingStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "pending",
    label: "Pendiente",
    description: "Registrado, pendiente de aprobación",
  },
  {
    value: "active",
    label: "Activo",
    description: "Aprobado y visible en la web",
  },
  {
    value: "suspended",
    label: "Suspendido",
    description: "Bloqueado temporalmente",
  },
];

const statusBadgeClass: Record<CampingStatus, string> = {
  pending: "bg-orange-100 text-brand-accent",
  active: "bg-green-100 text-brand-green",
  suspended: "bg-gray-100 text-gray-600",
};

type CampingStatusFormProps = {
  campingId: string;
  currentStatus: CampingStatus;
};

export default function CampingStatusForm({
  campingId,
  currentStatus,
}: CampingStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<CampingStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const hasChanges = status !== currentStatus;
  const selectedOption = statusOptions.find((option) => option.value === status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasChanges) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/campings/${campingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "No se pudo actualizar el estado.");
        return;
      }

      setSuccess("Estado guardado correctamente.");
      router.refresh();
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        htmlFor="camping-status"
        className="block text-sm font-medium text-gray-700"
      >
        Estado
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <select
            id="camping-status"
            value={status}
            disabled={loading}
            onChange={(e) => {
              setStatus(e.target.value as CampingStatus);
              setSuccess("");
              setError("");
            }}
            className="block w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-900 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !hasChanges}
          className="inline-flex h-[42px] w-full shrink-0 items-center justify-center rounded-lg bg-brand-accent px-6 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:w-auto"
        >
          {loading ? "Guardando…" : "Guardar estado"}
        </button>
      </div>

      {selectedOption && (
        <p className="text-xs text-gray-500">{selectedOption.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Estado actual:</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass[currentStatus]}`}
        >
          {statusOptions.find((option) => option.value === currentStatus)?.label}
        </span>
        {hasChanges && (
          <span className="text-xs text-brand-accent">
            →{" "}
            {
              statusOptions.find((option) => option.value === status)?.label
            }
          </span>
        )}
      </div>

      {!hasChanges && !success && !error && (
        <p className="text-xs text-gray-500">
          Cambia el estado y pulsa «Guardar estado» para aplicarlo.
        </p>
      )}

      {success && <p className="text-sm text-brand-green">{success}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
