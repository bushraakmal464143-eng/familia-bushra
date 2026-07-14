import type { OfferRecord, OfferSetting } from "@/lib/types";

const BEACH_KEYWORDS = [
  "playa",
  "mar",
  "costa",
  "mediterr",
  "atlánt",
  "orilla",
  "beach",
  "litoral",
];

const PET_KEYWORDS = ["mascota", "mascotas", "perro", "perros", "pet"];
const GLAMPING_KEYWORDS = ["glamping", "glamp"];
const HOTEL_KEYWORDS = ["hotel", "hoteles", "resort", "hostal"];

const ANY_DESTINATION = "cualquier destino disponible";

function offerSearchText(offer: OfferRecord): string {
  return [
    offer.title,
    offer.subtitle,
    offer.location,
    offer.region,
    offer.description,
    ...(offer.highlights ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

export function normalizeDestination(destino: string | undefined): string {
  return destino?.trim() ?? "";
}

export function isAnyDestination(destino: string): boolean {
  const normalized = destino.trim().toLowerCase();
  return !normalized || normalized === ANY_DESTINATION;
}

export function resolveOfferSetting(offer: OfferRecord): OfferSetting {
  if (offer.setting === "beach" || offer.setting === "mountain") {
    return offer.setting;
  }

  const text = offerSearchText(offer);
  return BEACH_KEYWORDS.some((keyword) => text.includes(keyword))
    ? "beach"
    : "mountain";
}

export function resolvePetFriendly(offer: OfferRecord): boolean {
  if (typeof offer.petFriendly === "boolean") return offer.petFriendly;
  return PET_KEYWORDS.some((keyword) => offerSearchText(offer).includes(keyword));
}

export function resolveGlamping(offer: OfferRecord): boolean {
  if (typeof offer.isGlamping === "boolean") return offer.isGlamping;
  return GLAMPING_KEYWORDS.some((keyword) => offerSearchText(offer).includes(keyword));
}

export function resolveHotel(offer: OfferRecord): boolean {
  if (typeof offer.isHotel === "boolean") return offer.isHotel;
  return HOTEL_KEYWORDS.some((keyword) => offerSearchText(offer).includes(keyword));
}

export function filterOffersBySetting(
  offers: OfferRecord[],
  setting: OfferSetting
): OfferRecord[] {
  return offers.filter((offer) => resolveOfferSetting(offer) === setting);
}

export function filterPetFriendlyOffers(offers: OfferRecord[]): OfferRecord[] {
  return offers.filter((offer) => resolvePetFriendly(offer));
}

export function filterGlampingOffers(offers: OfferRecord[]): OfferRecord[] {
  return offers.filter((offer) => resolveGlamping(offer));
}

export function filterHotelOffers(offers: OfferRecord[]): OfferRecord[] {
  return offers.filter((offer) => resolveHotel(offer));
}

export function filterHotelOffersBySetting(
  offers: OfferRecord[],
  setting: OfferSetting
): OfferRecord[] {
  return filterOffersBySetting(filterHotelOffers(offers), setting);
}

export function filterPetFriendlyHotelOffers(offers: OfferRecord[]): OfferRecord[] {
  return filterPetFriendlyOffers(filterHotelOffers(offers));
}

export function filterOffersByDestination(
  offers: OfferRecord[],
  destino: string | undefined
): OfferRecord[] {
  const query = normalizeDestination(destino);
  if (isAnyDestination(query)) return offers;

  const q = query.toLowerCase();
  return offers.filter((offer) => offerSearchText(offer).includes(q));
}

export type SearchQuery = {
  destino?: string;
  entrada?: string;
  salida?: string;
  adultos?: string;
  ninos?: string;
};

export function hasActiveSearch(params: SearchQuery): boolean {
  return Boolean(params.entrada && params.salida);
}
