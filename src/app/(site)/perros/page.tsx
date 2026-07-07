import CategoryCampingsPage from "@/components/CategoryCampingsPage";
import { filterPetFriendlyOffers } from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";
import type { SearchQuery } from "@/lib/search-offers";

export const dynamic = "force-dynamic";

const PET_HERO_IMAGE =
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: `Campings que admiten perros | ${SITE_NAME}`,
  description:
    "Reserva campings, glampings y hoteles en España. Encuentra campings pet friendly que admiten perros y mascotas.",
};

type Props = {
  searchParams: Promise<SearchQuery>;
};

export default function CampingsPerrosPage({ searchParams }: Props) {
  return (
    <CategoryCampingsPage
      searchParams={searchParams}
      filterOffers={filterPetFriendlyOffers}
      config={{
        heroImage: PET_HERO_IMAGE,
        heroAlt: "Camping que admite perros",
        overlayClassName: "bg-amber-950/50",
        subtitleClassName: "text-amber-50",
        title: "Campings que admiten perros",
        description:
          "Parcelas y bungalows donde tu perro es bienvenido. Reserva con confirmación al instante en {SITE_NAME}.",
        offersHeading: "Ofertas en campings pet friendly",
        searchTarget: "perros",
      }}
    />
  );
}
