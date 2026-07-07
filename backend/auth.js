const { randomBytes, scryptSync, timingSafeEqual, createHmac } = require("crypto");

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SEC = SESSION_MAX_AGE_MS / 1000;
const KEY_LEN = 64;

const COOKIES = {
  camping: "camping_session",
  customer: "customer_session",
};

function getSecret() {
  return process.env.ADMIN_SECRET ?? "cambiar-en-produccion";
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, KEY_LEN);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function sign(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function createRoleToken(role, subjectId) {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${role}:${subjectId}:${expires}`;
  return `${payload}.${sign(payload)}`;
}

function verifyRoleToken(token, role) {
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

function setRoleCookie(res, role, token) {
  res.cookie(COOKIES[role], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC * 1000,
  });
}

function clearRoleCookie(res, role) {
  res.clearCookie(COOKIES[role], { path: "/" });
}

async function generateId(collection, prefix) {
  const docs = await collection.find({}, { projection: { id: 1 } }).toArray();
  const numeric = docs
    .map((d) => parseInt(String(d.id).replace(`${prefix}_`, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : 0;
  return `${prefix}_${max + 1}`;
}

module.exports = {
  COOKIES,
  hashPassword,
  verifyPassword,
  createRoleToken,
  verifyRoleToken,
  setRoleCookie,
  clearRoleCookie,
  generateId,
};
