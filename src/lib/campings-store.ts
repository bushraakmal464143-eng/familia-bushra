import { readJson, writeJson, generateId } from "@/lib/json-store";
import { campingHasRequiredProfileFields } from "@/lib/camping-profile";
import { hashPassword } from "@/lib/password";
import { buildSeedCampings } from "@/lib/seed-data";
import { revalidateOfferPages } from "@/lib/revalidate-offers";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  nextPrefixedId,
} from "@/lib/supabase/client";
import {
  campingFromRow,
  campingToRow,
  type CampingRow,
} from "@/lib/supabase/mappers";
import type { Camping, CampingStatus } from "@/lib/types";

const FILE = "campings.json";

function normalizeCamping(camping: Camping): Camping {
  return {
    ...camping,
    profileComplete:
      typeof camping.profileComplete === "boolean"
        ? camping.profileComplete
        : campingHasRequiredProfileFields(camping),
  };
}

async function sbGetCampings(): Promise<Camping[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("campings")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data as CampingRow[]) ?? [];
  if (rows.length === 0) {
    const seeded = buildSeedCampings();
    const { error: seedError } = await getSupabaseAdmin()
      .from("campings")
      .upsert(seeded.map(campingToRow), { onConflict: "id" });
    if (seedError) throw seedError;
    const { data: seededRows, error: refetchError } = await getSupabaseAdmin()
      .from("campings")
      .select("*")
      .order("created_at", { ascending: true });
    if (refetchError) throw refetchError;
    return ((seededRows as CampingRow[]) ?? []).map((row) =>
      normalizeCamping(campingFromRow(row))
    );
  }
  return rows.map((row) => normalizeCamping(campingFromRow(row)));
}

export async function getCampings(): Promise<Camping[]> {
  if (isSupabaseConfigured()) return sbGetCampings();
  const campings = await readJson(FILE, buildSeedCampings());
  return campings.map(normalizeCamping);
}

export async function saveCampings(campings: Camping[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("campings")
      .upsert(campings.map(campingToRow), { onConflict: "id" });
    if (error) throw error;
    return;
  }
  await writeJson(FILE, campings);
}

export async function getCampingById(id: string): Promise<Camping | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("campings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeCamping(campingFromRow(data as CampingRow)) : undefined;
  }
  const campings = await getCampings();
  return campings.find((c) => c.id === id);
}

export async function getCampingByEmail(
  email: string
): Promise<Camping | undefined> {
  const normalized = email.trim().toLowerCase();
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("campings")
      .select("*")
      .eq("email", normalized)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeCamping(campingFromRow(data as CampingRow)) : undefined;
  }
  const campings = await getCampings();
  return campings.find((c) => c.email.toLowerCase() === normalized);
}

export async function createCampingAccount(data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  location?: string;
  region?: string;
  description?: string;
  profileComplete: boolean;
}): Promise<Camping> {
  const camping: Camping = {
    id: isSupabaseConfigured()
      ? await nextPrefixedId("campings", "camp")
      : generateId("camp", await getCampings()),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: data.passwordHash,
    phone: data.phone?.trim(),
    location: data.location?.trim() ?? "",
    region: data.region?.trim() ?? "",
    description: data.description?.trim() ?? "",
    photos: [],
    profileComplete: data.profileComplete,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("campings")
      .insert(campingToRow(camping));
    if (error) throw error;
    return camping;
  }

  const campings = await getCampings();
  campings.push(camping);
  await saveCampings(campings);
  return camping;
}

export async function registerCamping(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  region?: string;
  description?: string;
}): Promise<Camping> {
  const campings = await getCampings();
  if (campings.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  const location = data.location?.trim() ?? "";
  const region = data.region?.trim() ?? "";
  const description = data.description?.trim() ?? "";
  const phone = data.phone?.trim();
  return createCampingAccount({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
    phone,
    location,
    region,
    description,
    profileComplete: campingHasRequiredProfileFields({
      name: data.name,
      location,
      region,
      description,
      phone,
    }),
  });
}

export async function updateCamping(
  id: string,
  patch: Partial<
    Pick<
      Camping,
      | "name"
      | "phone"
      | "location"
      | "region"
      | "description"
      | "photos"
      | "status"
      | "profileComplete"
    >
  >
): Promise<Camping | undefined> {
  const current = await getCampingById(id);
  if (!current) return undefined;
  const updated = { ...current, ...patch };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("campings")
      .update(campingToRow(updated))
      .eq("id", id);
    if (error) throw error;
    return updated;
  }

  const campings = await getCampings();
  const index = campings.findIndex((c) => c.id === id);
  if (index < 0) return undefined;
  campings[index] = updated;
  await saveCampings(campings);
  return updated;
}

export async function addCampingPhoto(
  campingId: string,
  photoUrl: string
): Promise<Camping | undefined> {
  const camping = await getCampingById(campingId);
  if (!camping) return undefined;
  return updateCamping(campingId, { photos: [...camping.photos, photoUrl] });
}

export async function removeCampingPhoto(
  campingId: string,
  photoUrl: string
): Promise<Camping | undefined> {
  const camping = await getCampingById(campingId);
  if (!camping) return undefined;
  return updateCamping(campingId, {
    photos: camping.photos.filter((p) => p !== photoUrl),
  });
}

export async function setCampingStatus(
  id: string,
  status: CampingStatus
): Promise<Camping | undefined> {
  const camping = await updateCamping(id, { status });
  if (camping) revalidateOfferPages();
  return camping;
}

export function stripCampingSecrets(camping: Camping) {
  const { passwordHash: _, ...safe } = camping;
  return safe;
}
