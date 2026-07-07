import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_session";
const CAMPING_COOKIE = "camping_session";
const CUSTOMER_COOKIE = "customer_session";

function getSecret(): string {
  return (
    process.env.ADMIN_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "cambiar-en-produccion"
  );
}

async function verifyHmacToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const parts = payload.split(":");
  const expiresStr = parts[parts.length - 1];
  const expires = Number(expiresStr);
  if (Number.isNaN(expires) || expires <= Date.now()) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signature.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function redirectToLogin(
  request: NextRequest,
  path: string,
  from: string
) {
  const login = new URL(path, request.url);
  login.searchParams.set("from", from);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (pathname === "/admin/login") {
      const login = new URL("/cuenta/login", request.url);
      login.searchParams.set("from", "/admin");
      if (await verifyHmacToken(token)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(login);
    }
    if (!(await verifyHmacToken(token))) {
      return redirectToLogin(request, "/cuenta/login", pathname);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/camping")) {
    const publicPaths = ["/camping/login", "/camping/registro"];
    const token = request.cookies.get(CAMPING_COOKIE)?.value;
    if (publicPaths.includes(pathname)) {
      if (await verifyHmacToken(token)) {
        return NextResponse.redirect(new URL("/camping", request.url));
      }
      return NextResponse.next();
    }
    if (!(await verifyHmacToken(token))) {
      return redirectToLogin(request, "/camping/login", pathname);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/cuenta")) {
    const publicPaths = [
      "/cuenta/login",
      "/cuenta/registro",
      "/cuenta/recuperar",
      "/cuenta/restablecer",
    ];
    const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
    if (publicPaths.includes(pathname)) {
      if (await verifyHmacToken(token)) {
        return NextResponse.redirect(new URL("/cuenta", request.url));
      }
      return NextResponse.next();
    }
    if (!(await verifyHmacToken(token))) {
      return redirectToLogin(request, "/cuenta/login", pathname);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/camping/:path*", "/cuenta/:path*"],
};
