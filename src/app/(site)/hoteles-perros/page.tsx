import CategoryCampingsPage from "@/components/CategoryCampingsPage";
import { filterPetFriendlyHotelOffers } from "@/lib/search-offers";
import { SITE_NAME } from "@/lib/site";
import type { SearchQuery } from "@/lib/search-offers";

export const dynamic = "force-dynamic";

const HOTEL_PET_HERO =
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1920&q=80";

export const metadata = {
  title: `Hoteles que admiten perros | ${SITE_NAME}`,
  description:
    "Reserva hoteles pet friendly en España. Hoteles que admiten perros y mascotas.",
};

type Props = {
  searchParams: Promise<SearchQuery>;
};

export default function HotelesPerrosPage({ searchParams }: Props) {
  return (
    <CategoryCampingsPage
      searchParams={searchParams}
      filterOffers={filterPetFriendlyHotelOffers}
      config={{
        heroImage: HOTEL_PET_HERO,
        heroAlt: "Hotel que admite perros",
        overlayClassName: "bg-amber-950/50",
        subtitleClassName: "text-amber-50",
        title: "Hoteles que admiten perros",
        description:
          "Hoteles pet friendly donde tu perro es bienvenido. Reserva en {SITE_NAME}.",
        offersHeading: "Ofertas en hoteles pet friendly",
        searchTarget: "hoteles-perros",
      }}
    />
  );
}
