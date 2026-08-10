import { readJson, writeJson, generateId } from "@/lib/json-store";
import { campingHasRequiredProfileFields } from "@/lib/camping-profile";
import { hashPassword } from "@/lib/password";
import { buildSeedCampings } from "@/lib/seed-data";
import { revalidateOfferPages } from "@/lib/revalidate-offers";
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

export async function getCampings(): Promise<Camping[]> {
  const campings = await readJson(FILE, buildSeedCampings());
  return campings.map(normalizeCamping);
}

export async function saveCampings(campings: Camping[]): Promise<void> {
  await writeJson(FILE, campings);
}

export async function getCampingById(id: string): Promise<Camping | undefined> {
  const campings = await getCampings();
  return campings.find((c) => c.id === id);
}

export async function getCampingByEmail(
  email: string
): Promise<Camping | undefined> {
  const normalized = email.trim().toLowerCase();
  const campings = await getCampings();
  return campings.find((c) => c.email.toLowerCase() === normalized);
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

  const camping: Camping = {
    id: generateId("camp", campings),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: hashPassword(data.password),
    phone,
    location,
    region,
    description,
    photos: [],
    profileComplete: campingHasRequiredProfileFields({
      name: data.name,
      location,
      region,
      description,
      phone,
    }),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  campings.push(camping);
  await saveCampings(campings);
  return camping;
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
  const campings = await getCampings();
  const index = campings.findIndex((c) => c.id === id);
  if (index < 0) return undefined;
  campings[index] = { ...campings[index], ...patch };
  await saveCampings(campings);
  return campings[index];
}

export async function addCampingPhoto(
  campingId: string,
  photoUrl: string
): Promise<Camping | undefined> {
  const camping = await getCampingById(campingId);
  if (!camping) return undefined;
  const photos = [...camping.photos, photoUrl];
  return updateCamping(campingId, { photos });
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
  if (camping) {
    revalidateOfferPages();
  }
  return camping;
}

export function stripCampingSecrets(camping: Camping) {
  const { passwordHash: _, ...safe } = camping;
  return safe;
}
