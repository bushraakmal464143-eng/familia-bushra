import { randomBytes } from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
};

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export function getRedirectUri(requestUrl: string): string {
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configured) return configured;
  const origin = new URL(requestUrl).origin;
  return `${origin}/api/auth/google/callback`;
}

export function createOAuthState(): string {
  return randomBytes(24).toString("hex");
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function fetchGoogleProfile(
  code: string,
  redirectUri: string
): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!.trim();

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("GOOGLE_TOKEN_FAILED");
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error("GOOGLE_NO_ACCESS_TOKEN");
  }

  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error("GOOGLE_USERINFO_FAILED");
  }

  const user = (await userRes.json()) as {
    id?: string;
    email?: string;
    name?: string;
    verified_email?: boolean;
  };

  if (!user.id || !user.email) {
    throw new Error("GOOGLE_INCOMPLETE_PROFILE");
  }

  if (user.verified_email === false) {
    throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  }

  return {
    googleId: user.id,
    email: user.email.trim().toLowerCase(),
    name: (user.name ?? user.email).trim(),
  };
}
