"use client";

import { useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import {
  filterOffers,
  offerTabs,
  type OfferCategory,
} from "@/lib/offers";
import type { OfferRecord } from "@/lib/types";

type OffersSectionProps = {
  initialOffers: OfferRecord[];
  heading?: string;
  id?: string;
};

export default function OffersSection({
  initialOffers,
  heading = "Ofertas de campings de montaña",
  id,
}: OffersSectionProps) {
  const [activeTab, setActiveTab] = useState<OfferCategory | "all">("all");

  const filtered = useMemo(
    () => filterOffers(initialOffers, activeTab),
    [initialOffers, activeTab]
  );

  const featured = filtered.find((o) => o.featured) ?? filtered[0];
  const rest = filtered.filter((o) => o.id !== featured?.id);

  return (
    <section
      id={id}
      className="border-b border-gray-100 bg-white py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
            <p className="mt-1 text-gray-600">
              <span className="font-semibold text-brand-accent">
                {initialOffers.length} ofertas
              </span>{" "}
              disponibles · Hoy te recomendamos
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
          {offerTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-brand-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-gray-600">
            No hay ofertas en esta categoría por ahora.
          </p>
        ) : (
          <div className="mt-8 space-y-6">
            {featured && (
              <OfferCard offer={featured} featured />
            )}
            <div className="grid gap-6 md:grid-cols-2">
              {rest.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
