import { handleCampingRegister } from "@/lib/camping-auth";

export async function POST(request: Request) {
  return handleCampingRegister(request);
}
