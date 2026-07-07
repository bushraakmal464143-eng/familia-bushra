import { promises as fs } from "fs";
import path from "path";
import {
  formatMaxImageSizeLabel,
  MAX_IMAGE_BYTES,
} from "@/lib/image-upload-limits";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function validateImageFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Archivo requerido";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return formatMaxImageSizeLabel();
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "Formato no válido. Usa JPG, PNG o WebP.";
  }
  return null;
}

export async function saveUploadedImage(
  file: File,
  subdir: string
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = path.extname(file.name).toLowerCase();
  const filename = `${Date.now()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir.replace(/\\/g, "/")}/${filename}`;
}
