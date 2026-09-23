import { NextResponse } from "next/server";
import {
  stripCustomerSecrets,
  updateCustomerById,
} from "@/lib/customers-store";
import { saveUploadedImage } from "@/lib/save-uploaded-image";
import { getSessionSubject } from "@/lib/role-session";

export async function POST(request: Request) {
  const customerId = await getSessionSubject("customer");
  if (!customerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file, `customers/${customerId}`);
    const updated = await updateCustomerById(customerId, { avatarUrl: url });
    if (!updated) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      url,
      user: stripCustomerSecrets(updated),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo subir la imagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
