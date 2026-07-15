import Image from "next/image";
import CampingPartnerContact from "@/components/CampingPartnerContact";
import OffersSection from "@/components/OffersSection";
import SearchForm from "@/components/SearchForm";
import SearchScrollAnchor from "@/components/SearchScrollAnchor";
import { getPublicOffers } from "@/lib/offers-store";
import {
  filterOffersByDestination,
  isAnyDestination,
  normalizeDestination,
  type SearchQuery,
} from "@/lib/search-offers";
import { interleaveOffersByKind } from "@/lib/offer-display-pages";
import { getSiteSettings } from "@/lib/site-settings-store";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

const popularSearches = [
  { href: "/campings", label: "Campings de montaña", icon: "⛰️" },
  { href: "/playa", label: "Campings de playa", icon: "🏖️" },
  { href: "/perros", label: "Campings con perros", icon: "🐕" },
  { href: "/glamping", label: "Glampings", icon: "⛺" },
  { href: "/hoteles-playa", label: "Hoteles de playa", icon: "🏨" },
  { href: "/hoteles-montana", label: "Hoteles de montaña", icon: "🏔️" },
  { href: "/hoteles-perros", label: "Hoteles que admiten perros", icon: "🐶" },
];

const features = [
  { label: "Bar o restaurante", icon: "🍺" },
  { label: "Piscina", icon: "🏊" },
  { label: "Parque infantil", icon: "🎠" },
  { label: "Wi-Fi en el recinto", icon: "📶" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchQuery>;
}) {
  const params = await searchParams;
  const [allOffers, settings] = await Promise.all([
    getPublicOffers(),
    getSiteSettings(),
  ]);

  const destino = normalizeDestination(params.destino);
  const searching = Boolean(
    params.entrada ||
      params.salida ||
      (!isAnyDestination(destino) && destino) ||
      params.adultos
  );
  const filteredOffers = searching
    ? filterOffersByDestination(allOffers, destino)
    : allOffers;
  const offers = searching
    ? filteredOffers
    : interleaveOffersByKind(filteredOffers);

  function formatSearchDate(value: string | undefined): string {
    if (!value) return "";
    try {
      return format(parseISO(value), "d MMM yyyy", { locale: es });
    } catch {
      return value;
    }
  }

  const adults = Number(params.adultos) || 2;
  const children = Number(params.ninos) || 0;

  return (
    <>
      <SearchScrollAnchor />
      <section className="relative min-h-[50vh] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={settings.heroImageUrl}
            alt="Tienda de campaña en la montaña con vistas al valle"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-forest-dark/55" />
        </div>

        <div className="relative mx-auto flex min-h-[50vh] max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="w-full rounded-xl border border-white/20 bg-brand-forest/65 p-5 shadow-xl backdrop-blur-sm sm:p-7">
            <h1 className="text-xl font-bold leading-tight sm:text-3xl">
              {settings.heroTitle}
            </h1>
            <p className="mt-2 text-sm text-green-100">
              {settings.heroSubtitle}
            </p>
            <div className="mt-4 overflow-visible rounded-lg bg-transparent p-0 md:bg-white md:p-3">
              <SearchForm target="home" initialDestino={destino} />
            </div>
          </div>
        </div>
      </section>

      {searching && (
        <section className="border-b border-brand-accent/20 bg-orange-50 py-4">
          <div className="mx-auto max-w-7xl px-4 text-sm text-gray-700 sm:px-6 lg:px-8">
            <p>
              <span className="font-semibold text-brand-accent">
                {offers.length} resultado{offers.length === 1 ? "" : "s"}
              </span>
              {!isAnyDestination(destino) && ` · Destino: ${destino}`}
              {params.entrada &&
                params.salida &&
                ` · ${formatSearchDate(params.entrada)} – ${formatSearchDate(params.salida)}`}
              {` · ${children > 0 ? `${adults} adultos, ${children} niños` : `${adults} adultos`}`}
            </p>
          </div>
        </section>
      )}

      <OffersSection
        id="ofertas"
        initialOffers={offers}
        mixOrder={!searching}
        heading={
          searching
            ? offers.length > 0
              ? "Ofertas encontradas"
              : "Sin resultados"
            : "Ofertas de campings y hoteles"
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Búsquedas populares</h2>
        <p className="mt-1 text-gray-600">
          Lo que más buscan los campistas este año
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularSearches.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <span className="text-3xl" aria-hidden>
                {item.icon}
              </span>
              <span className="font-medium text-gray-800">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Servicios más solicitados
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <span className="text-3xl" aria-hidden>
                  {item.icon}
                </span>
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CampingPartnerContact />
    </>
  );
}
