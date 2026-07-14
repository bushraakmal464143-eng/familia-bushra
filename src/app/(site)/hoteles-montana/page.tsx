import CategoryCampingsPage from "@/components/CategoryCampingsPage";
import { filterHotelOffersBySetting } from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";
import type { SearchQuery } from "@/lib/search-offers";

export const dynamic = "force-dynamic";

const HOTEL_MOUNTAIN_HERO =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: `Hoteles de montaña | ${SITE_NAME}`,
  description:
    "Reserva hoteles de montaña en España. Pirineos, Picos de Europa, Sierra Nevada y más.",
};

type Props = {
  searchParams: Promise<SearchQuery>;
};

export default function HotelesMontanaPage({ searchParams }: Props) {
  return (
    <CategoryCampingsPage
      searchParams={searchParams}
      filterOffers={(offers) => filterHotelOffersBySetting(offers, "mountain")}
      config={{
        heroImage: HOTEL_MOUNTAIN_HERO,
        heroAlt: "Hotel de montaña con vistas al valle",
        overlayClassName: "bg-brand-forest-dark/55",
        title: "Hoteles de montaña",
        description:
          "Hoteles en plena montaña con comodidades y entornos naturales. Reserva en {SITE_NAME}.",
        offersHeading: "Ofertas de hoteles de montaña",
        searchTarget: "hoteles-montana",
      }}
    />
  );
}
