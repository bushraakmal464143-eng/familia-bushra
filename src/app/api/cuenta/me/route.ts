import { NextResponse } from "next/server";
import { handleCuentaMe } from "@/lib/cuenta-auth";
import { getSessionSubject } from "@/lib/role-session";

export async function GET() {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return handleCuentaMe(customerId);
}
