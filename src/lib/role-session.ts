import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type SessionRole = "camping" | "customer";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const COOKIES: Record<SessionRole, string> = {
  camping: "camping_session",
  customer: "customer_session",
};

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

export function createRoleToken(role: SessionRole, subjectId: string): string {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${role}:${subjectId}:${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyRoleToken(
  token: string | undefined,
  role: SessionRole
): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const [tokenRole, subjectId, expiresStr] = payload.split(":");
  if (tokenRole !== role || !subjectId) return null;
  const expires = Number(expiresStr);
  if (Number.isNaN(expires) || expires <= Date.now()) return null;
  return subjectId;
}

export async function getSessionSubject(
  role: SessionRole
): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIES[role])?.value;
  return verifyRoleToken(token, role);
}

export const SESSION_MAX_AGE_SEC = SESSION_MAX_AGE_MS / 1000;

export function roleCookieOptions(role: SessionRole, token: string) {
  return {
    name: COOKIES[role],
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
