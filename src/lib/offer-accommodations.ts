import type { OfferRecord } from "@/lib/types";
import { sanitizeOfferAccommodations } from "@/lib/offer-accommodation-units";

export type AccommodationOption = {
  id: string;
  name: string;
  image: string;
  infoText: string;
  pricePerPerson: number;
  maxGuests: number;
  roomsLeft?: number;
  refundable: boolean;
  available: boolean;
  unavailableReason?: string;
};

const UNIT_NAMES = [
  "Bungalow Familiar",
  "Chalet Évasion",
  "Chalet Portland",
  "Cabaña Canadienne",
  "Tienda Trappeur",
  "Parcela Premium",
];

function hashSeed(offerId: string, unitId: string): number {
  const raw = `${offerId}:${unitId}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getAccommodationsForOffer(
  offer: OfferRecord,
  guests: number,
  gallery: string[] = []
): AccommodationOption[] {
  const configured = sanitizeOfferAccommodations(offer.accommodations, offer);
  if (configured?.length) {
    return configured
      .filter((unit) => unit.enabled)
      .map((unit) => {
        const available = unit.maxGuests >= guests;
        return {
          id: unit.id,
          name: unit.name,
          image: unit.image,
          infoText: unit.infoText,
          pricePerPerson: unit.pricePerPerson,
          maxGuests: unit.maxGuests,
          roomsLeft: available ? unit.roomsLeft : undefined,
          refundable: unit.refundable,
          available,
          unavailableReason: available
            ? undefined
            : `Capacidad máxima: ${unit.maxGuests} personas`,
        };
      });
  }

  const images =
    gallery.length > 0
      ? gallery
      : [offer.image, "/offers/montana-1.svg", "/offers/montana-2.svg"];

  return UNIT_NAMES.map((name, index) => {
    const id = `acc_${index + 1}`;
    const seed = hashSeed(offer.id, id);
    const pricePerPerson = Math.max(
      offer.priceFrom,
      offer.priceFrom + (seed % 35) - 10
    );
    const maxGuests = 2 + (seed % 5);
    const roomsLeft = 1 + (seed % 4);
    const available = maxGuests >= guests && seed % 7 !== 0;

    return {
      id,
      name: index === 0 && offer.accommodationName ? offer.accommodationName : name,
      image: images[index % images.length] ?? offer.image,
      infoText: "Bungalow equipado con cocina, baño y terraza.",
      pricePerPerson,
      maxGuests,
      roomsLeft: available ? roomsLeft : undefined,
      refundable: seed % 3 === 0,
      available,
      unavailableReason: available
        ? undefined
        : maxGuests < guests
          ? `Capacidad máxima: ${maxGuests} personas`
          : "No disponible para estas fechas",
    };
  });
}

export function calculateAccommodationTotal(
  option: AccommodationOption,
  guests: number,
  nights: number
): number {
  return option.pricePerPerson * guests * nights;
}
