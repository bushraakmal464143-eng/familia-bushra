import type { Camping } from "@/lib/types";

/** Required fields before a campsite application can be reviewed by admin. */
export function isCampingProfileComplete(
  camping: Pick<
    Camping,
    "name" | "location" | "region" | "description" | "phone" | "profileComplete"
  >
): boolean {
  if (camping.profileComplete) return true;
  return Boolean(
    camping.name.trim() &&
      camping.location.trim() &&
      camping.region.trim() &&
      camping.description.trim() &&
      camping.phone?.trim()
  );
}

export function campingHasRequiredProfileFields(data: {
  name: string;
  location: string;
  region: string;
  description: string;
  phone?: string;
}): boolean {
  return Boolean(
    data.name.trim() &&
      data.location.trim() &&
      data.region.trim() &&
      data.description.trim() &&
      data.phone?.trim()
  );
}
