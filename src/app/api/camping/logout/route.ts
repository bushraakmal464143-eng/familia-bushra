import { handleCampingLogout } from "@/lib/camping-auth";

export async function POST() {
  return handleCampingLogout();
}
