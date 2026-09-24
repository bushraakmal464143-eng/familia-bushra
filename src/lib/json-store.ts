import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function isServerlessReadOnly(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  const file = path.join(DATA_DIR, filename);
  try {
    await fs.access(file);
    const raw = await fs.readFile(file, "utf-8");
    if (!raw.trim()) {
      throw new Error("Empty JSON file");
    }
    return JSON.parse(raw) as T;
  } catch {
    if (isServerlessReadOnly()) {
      return fallback;
    }
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf-8");
    } catch (err) {
      console.error("[json-store] could not seed file:", filename, err);
    }
    return fallback;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  if (isServerlessReadOnly()) {
    // Vercel filesystem is read-only; persistence must use Supabase.
    console.warn(`[json-store] skip write on serverless: ${filename}`);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export function generateId(prefix: string, existing: { id: string }[]): string {
  const numeric = existing
    .map((e) => e.id.replace(`${prefix}_`, ""))
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : 0;
  return `${prefix}_${max + 1}`;
}
