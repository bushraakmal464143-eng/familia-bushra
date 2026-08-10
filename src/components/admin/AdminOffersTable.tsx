"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteOfferButton from "@/components/admin/DeleteOfferButton";
import ApproveOfferButton from "@/components/admin/ApproveOfferButton";
import { OFFER_DISPLAY_PAGES } from "@/lib/offer-display-pages";
import { offerTabs } from "@/lib/offers";
import type { OfferRecord } from "@/lib/types";

type OfferFilter =
  | "all"
  | "pending"
  | "mountain"
  | "beach"
  | "dog"
  | "glamping"
  | "inactive";

const categoryLabel = Object.fromEntries(
  offerTabs.filter((t) => t.id !== "all").map((t) => [t.id, t.label])
);

const pageLabel = Object.fromEntries(
  OFFER_DISPLAY_PAGES.map((p) => [p.id, p.label])
);

function settingLabel(setting: OfferRecord["setting"]) {
  if (setting === "beach") return "Playa";
  if (setting === "mountain") return "Montaña";
  return "—";
}

function statusLabel(status: OfferRecord["status"]) {
  if (status === "active") return "Activa";
  if (status === "pending") return "Pendiente";
  if (status === "draft") return "Borrador";
  return "Inactiva";
}

function statusClass(status: OfferRecord["status"]) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-orange-50 text-brand-accent";
  if (status === "draft") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

export default function AdminOffersTable({
  offers,
  initialFilter = "all",
}: {
  offers: OfferRecord[];
  initialFilter?: OfferFilter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OfferFilter>(initialFilter);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers
      .filter((o) => {
        if (filter === "all") return true;
        if (filter === "pending") return o.status === "pending";
        if (filter === "mountain") return o.setting === "mountain";
        if (filter === "beach") return o.setting === "beach";
        if (filter === "dog") return Boolean(o.petFriendly);
        if (filter === "glamping") return Boolean(o.isGlamping);
        if (filter === "inactive") return o.status !== "active";
        return true;
      })
      .filter((o) => {
        if (!q) return true;
        const haystack = `${o.title} ${o.location} ${o.region} ${o.subtitle}`
          .toLowerCase()
          .trim();
        return haystack.includes(q);
      });
  }, [offers, query, filter]);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-sm">
            <label className="sr-only" htmlFor="offer-search">
              Buscar
            </label>
            <input
              id="offer-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, ubicación o región…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="sr-only" htmlFor="offer-filter">
              Filtro
            </label>
            <select
              id="offer-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as OfferFilter)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green sm:w-auto"
            >
              <option value="all">Todas las ofertas</option>
              <option value="pending">Pendientes de aprobación</option>
              <option value="beach">Playa</option>
              <option value="mountain">Montaña</option>
              <option value="dog">Dog-friendly</option>
              <option value="glamping">Glamping</option>
              <option value="inactive">Inactivas / borrador</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {filtered.length} / {offers.length}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Oferta</th>
                <th className="px-4 py-3">Páginas</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image
                          src={offer.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {offer.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {offer.location}
                          {offer.featured && (
                            <span className="ml-2 text-brand-accent">
                              · Destacada
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {(offer.displayPages ?? []).length > 0 ? (
                        offer.displayPages!.map((page) => (
                          <span
                            key={page}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {pageLabel[page] ?? page}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {settingLabel(offer.setting)}
                          </span>
                          {offer.isHotel ? (
                            <span className="rounded-full bg-sky-50 px-2 py-1 text-xs text-sky-700">
                              Hotel
                            </span>
                          ) : (
                            <span className="rounded-full bg-lime-50 px-2 py-1 text-xs text-lime-800">
                              Camping
                            </span>
                          )}
                          {offer.petFriendly && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                              Perros
                            </span>
                          )}
                          {offer.isGlamping && (
                            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                              Glamping
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {categoryLabel[offer.category] ?? offer.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                        offer.status
                      )}`}
                    >
                      {statusLabel(offer.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {offer.priceFrom} €
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {offer.status === "pending" && (
                        <>
                          <ApproveOfferButton offerId={offer.id} />
                          <ApproveOfferButton offerId={offer.id} reject />
                        </>
                      )}
                      <Link
                        href={`/admin/offers/${offer.id}/edit`}
                        className="text-sm font-medium text-brand-forest hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteOfferButton
                        offerId={offer.id}
                        offerTitle={offer.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-12 text-center text-gray-500">
            No hay ofertas con los filtros actuales.
          </p>
        )}
      </div>
    </div>
  );
}

