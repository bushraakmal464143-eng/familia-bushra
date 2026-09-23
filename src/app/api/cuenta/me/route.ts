import { NextResponse } from "next/server";
import { handleCuentaMe } from "@/lib/cuenta-auth";
import {
  stripCustomerSecrets,
  updateCustomerById,
} from "@/lib/customers-store";
import { getSessionSubject } from "@/lib/role-session";

export async function GET() {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return handleCuentaMe(customerId);
}

export async function PATCH(request: Request) {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    avatarUrl?: string | null;
  };

  const name = body.name?.trim() ?? "";
  if (name.length < 2) {
    return NextResponse.json(
      { error: "El nombre debe tener al menos 2 caracteres." },
      { status: 400 }
    );
  }
  if (name.length > 80) {
    return NextResponse.json(
      { error: "El nombre es demasiado largo." },
      { status: 400 }
    );
  }

  const patch: { name: string; avatarUrl?: string | undefined } = { name };
  if (body.avatarUrl !== undefined) {
    const url = body.avatarUrl?.trim() || undefined;
    if (url && !url.startsWith("/uploads/customers/")) {
      return NextResponse.json(
        { error: "Imagen de perfil no válida." },
        { status: 400 }
      );
    }
    patch.avatarUrl = url;
  }

  try {
    const updated = await updateCustomerById(customerId, patch);
    if (!updated) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ user: stripCustomerSecrets(updated) });
  } catch (err) {
    console.error("[cuenta/me] PATCH failed:", err);
    return NextResponse.json(
      { error: "No se pudo guardar el perfil." },
      { status: 500 }
    );
  }
}
