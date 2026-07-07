import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addCampingPhoto } from "@/lib/campings-store";
import {
  formatMaxImageSizeLabel,
  MAX_IMAGE_BYTES,
} from "@/lib/image-upload-limits";
import { getSessionSubject } from "@/lib/role-session";

export async function POST(request: Request) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: formatMaxImageSizeLabel() }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : ".jpg";
  const filename = `${Date.now()}${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", "campings", campingId);
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  const url = `/uploads/campings/${campingId}/${filename}`;
  const camping = await addCampingPhoto(campingId, url);
  return NextResponse.json({ url, camping: camping ? { photos: camping.photos } : null });
}

export async function DELETE(request: Request) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { photoUrl } = (await request.json()) as { photoUrl?: string };
  if (!photoUrl) {
    return NextResponse.json({ error: "URL requerida" }, { status: 400 });
  }
  const { removeCampingPhoto } = await import("@/lib/campings-store");
  const camping = await removeCampingPhoto(campingId, photoUrl);
  return NextResponse.json({ ok: true, photos: camping?.photos ?? [] });
}
