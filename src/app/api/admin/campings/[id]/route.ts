import { NextResponse } from "next/server";
import { getCampingById, setCampingStatus, stripCampingSecrets } from "@/lib/campings-store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { CampingStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const camping = await getCampingById(id);
  if (!camping) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(stripCampingSecrets(camping));
}

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json()) as { status?: CampingStatus };
  if (!body.status) {
    return NextResponse.json({ error: "Estado requerido" }, { status: 400 });
  }
  const camping = await setCampingStatus(id, body.status);
  if (!camping) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(stripCampingSecrets(camping));
}
