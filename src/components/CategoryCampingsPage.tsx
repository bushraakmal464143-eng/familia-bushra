import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import OffersSection from "@/components/OffersSection";
import SearchForm, { type SearchFormTarget } from "@/components/SearchForm";
import { getPublicOffers } from "@/lib/offers-store";
import type { OfferRecord } from "@/lib/types";
import {
  filterOffersByDestination,
  hasActiveSearch,
  isAnyDestination,
  normalizeDestination,
  type SearchQuery,
} from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";

export type CategoryCampingsConfig = {
  heroImage: string;
  heroAlt: string;
  overlayClassName?: string;
  title: string;
  description: string;
  offersHeading: string;
  searchTarget: SearchFormTarget;
  subtitleClassName?: string;
};

type Props = {
  searchParams: Promise<SearchQuery>;
  config: CategoryCampingsConfig;
  filterOffers: (offers: OfferRecord[]) => OfferRecord[];
};

function formatSearchDate(value: string | undefined): string {
  if (!value) return "";
  try {
    return format(parseISO(value), "d MMM yyyy", { locale: es });
  } catch {
    return value;
  }
}

export default async function CategoryCampingsPage({
  searchParams,
  config,
  filterOffers,
}: Props) {
  const params = await searchParams;
  const allOffers = await getPublicOffers();

  const destino = normalizeDestination(params.destino);
  const categoryOffers = filterOffers(allOffers);
  const offers = filterOffersByDestination(categoryOffers, destino);
  const searching = hasActiveSearch(params);
  const adults = Number(params.adultos) || 2;
  const children = Number(params.ninos) || 0;
  const subtitleClass = config.subtitleClassName ?? "text-green-100";

  return (
    <>
      <section className="relative border-b border-brand-forest/20 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={config.heroImage}
            alt={config.heroAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className={`absolute inset-0 ${config.overlayClassName ?? "bg-brand-forest-dark/55"}`}
          />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {searching ? "Resultados de búsqueda" : config.title}
          </h1>
          {searching ? (
            <p className={`mt-3 max-w-2xl ${subtitleClass}`}>
              {isAnyDestination(destino)
                ? "Todos los destinos"
                : `Destino: ${destino}`}
              {" · "}
              {formatSearchDate(params.entrada)} – {formatSearchDate(params.salida)}
              {" · "}
              {children > 0
                ? `${adults} adultos, ${children} niños`
                : `${adults} adultos`}
            </p>
          ) : (
            <p className={`mt-3 max-w-2xl ${subtitleClass}`}>
              {config.description.replace("{SITE_NAME}", SITE_NAME)}
            </p>
          )}
          <div className="mt-6 rounded-lg bg-white p-2 sm:p-3">
            <SearchForm
              target={config.searchTarget}
              initialDestino={destino}
              initialEntrada={params.entrada}
              initialSalida={params.salida}
              initialAdults={adults}
              initialChildren={children}
            />
          </div>
        </div>
      </section>

      {searching && offers.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            No hay ofertas para esta búsqueda. Prueba otro destino o fechas.
          </p>
        </section>
      ) : (
        <OffersSection
          initialOffers={offers}
          heading={
            searching
              ? `${offers.length} oferta${offers.length === 1 ? "" : "s"} encontrada${offers.length === 1 ? "" : "s"}`
              : config.offersHeading
          }
        />
      )}
    </>
  );
}
