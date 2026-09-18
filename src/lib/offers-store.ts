import { defaultOffers, type OfferCategory } from "@/lib/offers";
import { cleanSubtitle } from "@/lib/clean-offer-text";
import { readJson, writeJson } from "@/lib/json-store";
import { getCampings } from "@/lib/campings-store";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  nextOfferId,
} from "@/lib/supabase/client";
import {
  offerFromRow,
  offerToRow,
  type OfferRow,
} from "@/lib/supabase/mappers";
import { campingIdByOfferIndex } from "@/lib/seed-data";
import { revalidateOfferPages } from "@/lib/revalidate-offers";
import {
  inferDisplayPagesFromFlags,
  sanitizeDisplayPages,
} from "@/lib/offer-display-pages";
import {
  resolveOfferSetting,
  resolvePetFriendly,
  resolveGlamping,
  resolveHotel,
} from "@/lib/search-offers";
import type { OfferRecord, OfferStatus } from "@/lib/types";
import { sanitizeOfferAccommodations } from "@/lib/offer-accommodation-units";
import { parseMapCoordinate } from "@/lib/offer-map";

const FILE = "offers.json";

function migrateLegacyOffer(
  raw: Record<string, unknown>,
  index: number
): OfferRecord {
  const category = (raw.category as OfferCategory) ?? "new";
  const safeCategory =
    category === "all" ? "new" : (category as Exclude<OfferCategory, "all">);
  const base: OfferRecord = {
    id: String(raw.id ?? index),
    campingId:
      (raw.campingId as string) ??
      campingIdByOfferIndex[index] ??
      "camp_1",
    title: String(raw.title ?? ""),
    subtitle: cleanSubtitle(String(raw.subtitle ?? "")),
    location: String(raw.location ?? ""),
    region: String(raw.region ?? ""),
    mealPlan: raw.mealPlan as string | undefined,
    highlights: Array.isArray(raw.highlights)
      ? (raw.highlights as string[])
      : [],
    description: String(raw.description ?? ""),
    travelDates: String(raw.travelDates ?? ""),
    priceFrom: Number(raw.priceFrom) || 0,
    image: String(raw.image ?? "/offers/cabin-style.png"),
    gallery: raw.gallery as string[] | undefined,
    badge: raw.badge as string | undefined,
    countdown: raw.countdown as string | undefined,
    countdownProgress:
      typeof raw.countdownProgress === "number"
        ? Math.max(0, Math.min(100, raw.countdownProgress))
        : undefined,
    nightsOptions: Array.isArray(raw.nightsOptions)
      ? (raw.nightsOptions as unknown[])
          .map((n) => Number(n))
          .filter((n) => Number.isFinite(n) && n > 0)
          .map((n) => Math.floor(n))
          .slice(0, 12)
      : undefined,
    ctaText: typeof raw.ctaText === "string" ? raw.ctaText : undefined,
    accommodationName:
      typeof raw.accommodationName === "string" ? raw.accommodationName : undefined,
    accommodationLinkText:
      typeof raw.accommodationLinkText === "string"
        ? raw.accommodationLinkText
        : undefined,
    accommodations: sanitizeOfferAccommodations(raw.accommodations, {
      priceFrom: Number(raw.priceFrom) || 0,
      image: String(raw.image ?? "/offers/cabin-style.png"),
    }),
    mapLabel: typeof raw.mapLabel === "string" ? raw.mapLabel : undefined,
    mapLat: parseMapCoordinate(raw.mapLat, "lat"),
    mapLng: parseMapCoordinate(raw.mapLng, "lng"),
    category: safeCategory,
    displayPages: sanitizeDisplayPages(raw.displayPages),
    setting:
      raw.setting === "beach" || raw.setting === "mountain"
        ? raw.setting
        : undefined,
    petFriendly:
      typeof raw.petFriendly === "boolean" ? raw.petFriendly : undefined,
    isGlamping:
      typeof raw.isGlamping === "boolean" ? raw.isGlamping : undefined,
    isHotel: typeof raw.isHotel === "boolean" ? raw.isHotel : undefined,
    status: (raw.status as OfferStatus) ?? "active",
    featured: Boolean(raw.featured),
  };

  const withFlags = {
    ...base,
    setting: base.setting ?? resolveOfferSetting(base),
    petFriendly: base.petFriendly ?? resolvePetFriendly(base),
    isGlamping: base.isGlamping ?? resolveGlamping(base),
    isHotel: base.isHotel ?? resolveHotel(base),
  };

  return {
    ...withFlags,
    displayPages:
      withFlags.displayPages ?? inferDisplayPagesFromFlags(withFlags),
  };
}

function buildSeedOffers(): OfferRecord[] {
  return defaultOffers.map((o, i) =>
    migrateLegacyOffer(o as unknown as Record<string, unknown>, i)
  );
}

async function sbGetOffers(): Promise<OfferRecord[]> {
  await getCampings();

  const { data, error } = await getSupabaseAdmin()
    .from("offers")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  const rows = (data as OfferRow[]) ?? [];
  if (rows.length === 0) {
    const seeded = buildSeedOffers();
    const { error: seedError } = await getSupabaseAdmin()
      .from("offers")
      .upsert(seeded.map(offerToRow), { onConflict: "id" });
    if (seedError) throw seedError;
    const { data: seededRows, error: refetchError } = await getSupabaseAdmin()
      .from("offers")
      .select("*")
      .order("id", { ascending: true });
    if (refetchError) throw refetchError;
    return ((seededRows as OfferRow[]) ?? []).map(offerFromRow);
  }
  return rows.map(offerFromRow);
}

export async function getOffers(): Promise<OfferRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      return await sbGetOffers();
    } catch (err) {
      console.error("[offers] falling back to local seed:", err);
      return buildSeedOffers();
    }
  }

  const raw = await readJson<unknown[]>(FILE, buildSeedOffers());
  const offers = raw.map((item, i) =>
    migrateLegacyOffer(item as Record<string, unknown>, i)
  );

  const needsCleanup = raw.some((item, i) => {
    const legacy = item as Record<string, unknown>;
    const subtitle = String(legacy.subtitle ?? "");
    return (
      subtitle !== offers[i].subtitle ||
      "rating" in legacy ||
      "reviews" in legacy ||
      "freeCancellation" in legacy
    );
  });

  if (needsCleanup) {
    await saveOffers(offers);
  }

  return offers;
}

export async function saveOffers(offers: OfferRecord[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("offers")
      .upsert(offers.map(offerToRow), { onConflict: "id" });
    if (error) throw error;
    return;
  }
  await writeJson(FILE, offers);
}

export async function getOfferById(id: string): Promise<OfferRecord | undefined> {
  const offers = await getOffers();
  return offers.find((o) => o.id === id);
}

export async function getOffersByCamping(
  campingId: string
): Promise<OfferRecord[]> {
  const offers = await getOffers();
  return offers.filter((o) => o.campingId === campingId);
}

export async function upsertOffer(offer: OfferRecord): Promise<OfferRecord> {
  const offers = await getOffers();
  const cleaned = { ...offer, subtitle: cleanSubtitle(offer.subtitle) };
  const index = offers.findIndex((o) => o.id === cleaned.id);
  if (index >= 0) {
    offers[index] = cleaned;
  } else {
    offers.push(cleaned);
  }
  await saveOffers(offers);
  revalidateOfferPages(cleaned.id);
  return cleaned;
}

export async function deleteOffer(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("offers")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return false;
    revalidateOfferPages(id);
    return true;
  }

  const offers = await getOffers();
  const next = offers.filter((o) => o.id !== id);
  if (next.length === offers.length) return false;
  await saveOffers(next);
  revalidateOfferPages(id);
  return true;
}

export async function generateOfferId(existing: OfferRecord[]): Promise<string> {
  if (isSupabaseConfigured()) return nextOfferId();
  const numeric = existing
    .map((o) => parseInt(o.id, 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : -1;
  return String(max + 1);
}

export async function getPublicOffers(): Promise<OfferRecord[]> {
  const [offers, campings] = await Promise.all([getOffers(), getCampings()]);
  const activeCampingIds = new Set(
    campings.filter((c) => c.status === "active").map((c) => c.id)
  );
  return offers.filter(
    (o) => o.status === "active" && activeCampingIds.has(o.campingId)
  );
}
