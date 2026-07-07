import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findOrCreateCustomerFromGoogle } from "@/lib/customers-store";
import {
  fetchGoogleProfile,
  getRedirectUri,
  isGoogleAuthConfigured,
} from "@/lib/google-oauth";
import { createRoleToken, roleCookieOptions } from "@/lib/role-session";

const STATE_COOKIE = "google_oauth_state";
const FROM_COOKIE = "google_oauth_from";

function loginErrorRedirect(request: Request, code: string) {
  const login = new URL("/cuenta/login", request.url);
  login.searchParams.set("error", code);
  return NextResponse.redirect(login);
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(FROM_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return loginErrorRedirect(request, "google_not_configured");
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return loginErrorRedirect(request, "google_denied");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  const fromRaw = cookieStore.get(FROM_COOKIE)?.value ?? "/cuenta";
  const from =
    fromRaw.startsWith("/") && !fromRaw.startsWith("//") ? fromRaw : "/cuenta";

  if (!code || !state || !savedState || state !== savedState) {
    const res = loginErrorRedirect(request, "google_invalid_state");
    clearOAuthCookies(res);
    return res;
  }

  try {
    const redirectUri = getRedirectUri(request.url);
    const profile = await fetchGoogleProfile(code, redirectUri);
    const customer = await findOrCreateCustomerFromGoogle(profile);
    const token = createRoleToken("customer", customer.id);

    const response = NextResponse.redirect(new URL(from, request.url));
    const opts = roleCookieOptions("customer", token);
    response.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    clearOAuthCookies(response);
    return response;
  } catch {
    const res = loginErrorRedirect(request, "google_failed");
    clearOAuthCookies(res);
    return res;
  }
}
