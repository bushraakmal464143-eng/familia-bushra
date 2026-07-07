import { NextResponse } from "next/server";
import { getCampingById, stripCampingSecrets } from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";

export async function GET() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const camping = await getCampingById(campingId);
  if (!camping) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(stripCampingSecrets(camping));
}
