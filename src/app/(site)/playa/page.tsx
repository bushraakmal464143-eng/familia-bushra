import CategoryCampingsPage from "@/components/CategoryCampingsPage";
import { filterOffersBySetting } from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";
import type { SearchQuery } from "@/lib/search-offers";

export const dynamic = "force-dynamic";

const BEACH_HERO_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: `Campings de playa | ${SITE_NAME}`,
  description:
    "Reserva campings, glampings y hoteles en España. Ofertas junto al mar: Costa Brava, Costa del Sol y Costa Cálida.",
};

type Props = {
  searchParams: Promise<SearchQuery>;
};

export default function CampingsPlayaPage({ searchParams }: Props) {
  return (
    <CategoryCampingsPage
      searchParams={searchParams}
      filterOffers={(offers) => filterOffersBySetting(offers, "beach")}
      config={{
        heroImage: BEACH_HERO_IMAGE,
        heroAlt: "Camping junto al mar",
        overlayClassName: "bg-sky-950/50",
        subtitleClassName: "text-sky-100",
        title: "Campings de playa",
        description:
          "Parcelas, bungalows y glamping a pocos metros del mar. Reserva con confirmación al instante en {SITE_NAME}.",
        offersHeading: "Ofertas de campings junto al mar",
        searchTarget: "playa",
      }}
    />
  );
}
