import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  createOAuthState,
  getRedirectUri,
  isGoogleAuthConfigured,
} from "@/lib/google-oauth";

const STATE_COOKIE = "google_oauth_state";
const FROM_COOKIE = "google_oauth_from";

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json(
      { error: "Google sign-in is not configured" },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "/cuenta";
  const safeFrom =
    from.startsWith("/") && !from.startsWith("//") ? from : "/cuenta";

  const state = createOAuthState();
  const redirectUri = getRedirectUri(request.url);
  const authUrl = buildGoogleAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(authUrl);
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  response.cookies.set(STATE_COOKIE, state, cookieOpts);
  response.cookies.set(FROM_COOKIE, safeFrom, cookieOpts);
  return response;
}
