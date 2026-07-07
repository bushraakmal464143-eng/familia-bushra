const { createHmac, timingSafeEqual } = require("crypto");

const ADMIN_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SEC = SESSION_MAX_AGE_MS / 1000;

function getSecret() {
  return (
    process.env.ADMIN_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "cambiar-en-produccion"
  );
}

function sign(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function createAdminSessionToken() {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function verifyAdminSessionToken(token) {
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

function setAdminCookie(res) {
  const token = createAdminSessionToken();
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC * 1000,
  });
}

function clearAdminCookie(res) {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
}

module.exports = {
  ADMIN_COOKIE,
  setAdminCookie,
  clearAdminCookie,
  verifyAdminSessionToken,
};
