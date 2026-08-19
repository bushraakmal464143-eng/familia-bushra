import { handleCampingLogin } from "@/lib/camping-auth";

export async function POST(request: Request) {
  return handleCampingLogin(request);
}
