const { timingSafeEqual } = require("crypto");

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "Admin@$#123";
}

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? "adminofertas123@gmail.com")
    .trim()
    .toLowerCase();
}

function verifyAdminPassword(password) {
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

function verifyAdminCredentials(email, password) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (normalizedEmail !== getAdminEmail()) return false;
  return verifyAdminPassword(password);
}

module.exports = {
  getAdminEmail,
  getAdminPassword,
  verifyAdminCredentials,
};
