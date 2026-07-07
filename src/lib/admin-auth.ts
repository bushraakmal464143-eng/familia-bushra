import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createSessionToken,
  SESSION_MAX_AGE_SEC,
  verifySessionToken,
} from "@/lib/admin-session";

export { ADMIN_COOKIE, createSessionToken, verifySessionToken };

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "Admin@$#123";
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "adminofertas123@gmail.com")
    .trim()
    .toLowerCase();
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== getAdminEmail()) return false;
  return verifyAdminPassword(password);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
