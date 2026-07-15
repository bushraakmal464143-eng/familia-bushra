import CategoryCampingsPage from "@/components/CategoryCampingsPage";
import { filterGlampingOffers } from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";
import type { SearchQuery } from "@/lib/search-offers";

export const dynamic = "force-dynamic";

const GLAMPING_HERO_IMAGE =
  "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: `Glampings en España | ${SITE_NAME}`,
  description:
    "Reserva campings, glampings y hoteles en España. Tiendas de lujo, domos y bungalows premium en plena naturaleza.",
};

type Props = {
  searchParams: Promise<SearchQuery>;
};

export default function GlampingsPage({ searchParams }: Props) {
  return (
    <CategoryCampingsPage
      searchParams={searchParams}
      filterOffers={filterGlampingOffers}
      config={{
        heroImage: GLAMPING_HERO_IMAGE,
        heroAlt: "Glamping en la naturaleza",
        overlayClassName: "bg-brand-forest-dark/60",
        title: "Glampings",
        description:
          "Tiendas de lujo, domos y alojamientos premium con todas las comodidades. Reserva en {SITE_NAME}.",
        offersHeading: "Ofertas de glamping en España",
        searchTarget: "glamping",
      }}
    />
  );
}
