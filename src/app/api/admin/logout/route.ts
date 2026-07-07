import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const opts = clearSessionCookieOptions();
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}
