import CategoryCampingsPage from "@/components/CategoryCampingsPage";
import { filterHotelOffersBySetting } from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";
import type { SearchQuery } from "@/lib/search-offers";

export const dynamic = "force-dynamic";

const HOTEL_BEACH_HERO =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: `Hoteles de playa | ${SITE_NAME}`,
  description:
    "Reserva hoteles de playa en España. Ofertas junto al mar: Costa Brava, Costa del Sol y Costa Cálida.",
};

type Props = {
  searchParams: Promise<SearchQuery>;
};

export default function HotelesPlayaPage({ searchParams }: Props) {
  return (
    <CategoryCampingsPage
      searchParams={searchParams}
      filterOffers={(offers) => filterHotelOffersBySetting(offers, "beach")}
      config={{
        heroImage: HOTEL_BEACH_HERO,
        heroAlt: "Hotel de playa junto al mar",
        overlayClassName: "bg-sky-950/50",
        subtitleClassName: "text-sky-100",
        title: "Hoteles de playa",
        description:
          "Hoteles frente al mar con vistas, piscina y acceso a la playa. Reserva en {SITE_NAME}.",
        offersHeading: "Ofertas de hoteles de playa",
        searchTarget: "hoteles-playa",
      }}
    />
  );
}
