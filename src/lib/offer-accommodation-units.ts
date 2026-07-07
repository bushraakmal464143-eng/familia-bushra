import type { OfferAccommodationUnit, OfferRecord } from "@/lib/types";

export function createEmptyAccommodationUnit(
  defaults?: Partial<Pick<OfferAccommodationUnit, "name" | "image" | "pricePerPerson">>
): OfferAccommodationUnit {
  return {
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: defaults?.name ?? "",
    image: defaults?.image ?? "/offers/cabin-style.png",
    infoText: "Bungalow equipado con cocina, baño y terraza.",
    pricePerPerson: defaults?.pricePerPerson ?? 0,
    maxGuests: 4,
    roomsLeft: 2,
    refundable: false,
    enabled: true,
  };
}

export function sanitizeOfferAccommodations(
  raw: unknown,
  offer: Pick<OfferRecord, "priceFrom" | "image">
): OfferAccommodationUnit[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  const units = raw
    .map((item, index) => {
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      if (!name) return null;

      const pricePerPerson = Number(row.pricePerPerson);
      const maxGuests = Math.max(1, Math.floor(Number(row.maxGuests) || 1));
      const roomsLeftRaw = row.roomsLeft;
      const roomsLeft =
        roomsLeftRaw != null && roomsLeftRaw !== ""
          ? Math.max(0, Math.floor(Number(roomsLeftRaw)))
          : undefined;

      return {
        id: String(row.id ?? `acc_${index + 1}`).trim() || `acc_${index + 1}`,
        name,
        image: String(row.image ?? offer.image).trim() || offer.image,
        infoText:
          String(row.infoText ?? "").trim() ||
          "Bungalow equipado con cocina, baño y terraza.",
        pricePerPerson:
          Number.isFinite(pricePerPerson) && pricePerPerson > 0
            ? pricePerPerson
            : offer.priceFrom,
        maxGuests,
        roomsLeft,
        refundable: Boolean(row.refundable),
        enabled: row.enabled !== false,
      } satisfies OfferAccommodationUnit;
    })
    .filter((unit): unit is OfferAccommodationUnit => unit != null);

  return units.length > 0 ? units : undefined;
}
