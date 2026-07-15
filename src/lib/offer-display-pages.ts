import type { OfferDisplayPage, OfferRecord, OfferSetting } from "@/lib/types";

export const OFFER_DISPLAY_PAGES: {
  id: OfferDisplayPage;
  label: string;
  group: "camping" | "hotel";
}[] = [
  { id: "campings", label: "Campings de montaña", group: "camping" },
  { id: "playa", label: "Campings de playa", group: "camping" },
  { id: "perros", label: "Campings con perros", group: "camping" },
  { id: "glamping", label: "Glampings", group: "camping" },
  { id: "hoteles-playa", label: "Hoteles de playa", group: "hotel" },
  { id: "hoteles-montana", label: "Hoteles de montaña", group: "hotel" },
  { id: "hoteles-perros", label: "Hoteles que admiten perros", group: "hotel" },
];

const ALL_PAGE_IDS = new Set(OFFER_DISPLAY_PAGES.map((p) => p.id));

export function sanitizeDisplayPages(
  value: unknown
): OfferDisplayPage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const pages = value
    .map((item) => String(item))
    .filter((item): item is OfferDisplayPage =>
      ALL_PAGE_IDS.has(item as OfferDisplayPage)
    );
  const unique = [...new Set(pages)];
  return unique.length > 0 ? unique : undefined;
}

/** Infer pages from legacy flags when displayPages was never set. */
export function inferDisplayPagesFromFlags(offer: {
  setting?: OfferSetting;
  petFriendly?: boolean;
  isGlamping?: boolean;
  isHotel?: boolean;
}): OfferDisplayPage[] {
  const pages: OfferDisplayPage[] = [];
  const setting = offer.setting === "beach" ? "beach" : "mountain";

  if (offer.isHotel) {
    if (setting === "beach") pages.push("hoteles-playa");
    else pages.push("hoteles-montana");
    if (offer.petFriendly) pages.push("hoteles-perros");
  } else {
    if (setting === "beach") pages.push("playa");
    else pages.push("campings");
    if (offer.petFriendly) pages.push("perros");
    if (offer.isGlamping) pages.push("glamping");
  }

  return pages;
}

export function resolveDisplayPages(offer: OfferRecord): OfferDisplayPage[] {
  if (offer.displayPages && offer.displayPages.length > 0) {
    return offer.displayPages;
  }
  return inferDisplayPagesFromFlags(offer);
}

export function offerShowsOnPage(
  offer: OfferRecord,
  page: OfferDisplayPage
): boolean {
  return resolveDisplayPages(offer).includes(page);
}

/**
 * Primary kind used to mix home-page order
 * (mountain / beach / pets / glamping / hotels).
 */
export function offerPrimaryKind(offer: OfferRecord): OfferDisplayPage {
  const pages = resolveDisplayPages(offer);
  if (pages.length > 0) return pages[0]!;
  return inferDisplayPagesFromFlags(offer)[0] ?? "campings";
}

/** Round-robin mix so types (camping, beach, glamping, hotels…) alternate. */
export function interleaveOffersByKind(offers: OfferRecord[]): OfferRecord[] {
  const buckets = new Map<string, OfferRecord[]>();
  for (const offer of offers) {
    const kind = offerPrimaryKind(offer);
    const list = buckets.get(kind) ?? [];
    list.push(offer);
    buckets.set(kind, list);
  }

  // Stable category order so the mix looks intentional, not random each time.
  const order = OFFER_DISPLAY_PAGES.map((p) => p.id);
  const queues = order
    .map((id) => buckets.get(id) ?? [])
    .filter((q) => q.length > 0);

  // Any unexpected kinds go last.
  for (const [id, list] of buckets) {
    if (!order.includes(id as OfferDisplayPage) && list.length > 0) {
      queues.push(list);
    }
  }

  const result: OfferRecord[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next) {
        result.push(next);
        added = true;
      }
    }
  }
  return result;
}

/** Keep isHotel / setting / pets / glamping in sync with selected pages. */
export function flagsFromDisplayPages(pages: OfferDisplayPage[]): {
  setting: OfferSetting;
  isHotel: boolean;
  petFriendly: boolean;
  isGlamping: boolean;
} {
  const hasCampingPage = pages.some(
    (p) =>
      p === "campings" || p === "playa" || p === "perros" || p === "glamping"
  );
  const hasHotelPage = pages.some((p) => p.startsWith("hoteles-"));
  const hasBeach =
    pages.includes("playa") || pages.includes("hoteles-playa");
  const hasMountain =
    pages.includes("campings") || pages.includes("hoteles-montana");

  let setting: OfferSetting = "mountain";
  if (hasBeach && !hasMountain) setting = "beach";
  else if (hasBeach && hasMountain) setting = "beach";
  else if (hasBeach) setting = "beach";

  return {
    setting,
    // Hotel only when hotel pages are selected and no camping pages.
    isHotel: hasHotelPage && !hasCampingPage,
    petFriendly: pages.includes("perros") || pages.includes("hoteles-perros"),
    isGlamping: pages.includes("glamping"),
  };
}
