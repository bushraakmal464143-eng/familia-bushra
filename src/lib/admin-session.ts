import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return (
    process.env.ADMIN_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "cambiar-en-produccion"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;
  const expected = sign(expiresStr);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const expires = Number(expiresStr);
  return !Number.isNaN(expires) && expires > Date.now();
}

export const SESSION_MAX_AGE_SEC = SESSION_MAX_AGE_MS / 1000;
