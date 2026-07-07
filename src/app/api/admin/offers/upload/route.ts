import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveUploadedImage } from "@/lib/save-uploaded-image";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file, "offers");
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
