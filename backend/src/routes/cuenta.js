const express = require("express");
const { createHash, randomBytes } = require("crypto");
const Customer = require("../models/Customer");
const { verifyAdminCredentials, getAdminEmail } = require("../utils/adminAuth");
const { setAdminCookie, clearAdminCookie } = require("../utils/adminSession");
const { hashPassword, verifyPassword } = require("../utils/password");
const { isStrongPassword, STRONG_PASSWORD_MESSAGE } = require("../utils/strongPassword");
const {
  setRoleCookie,
  clearRoleCookie,
  getCustomerIdFromRequest,
} = require("../utils/session");
const { syncCustomerToJson, generateCustomerId } = require("../utils/jsonSync");
const { sendPasswordResetEmail } = require("../utils/sendPasswordResetEmail");

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const router = express.Router();

function stripCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    createdAt: customer.createdAt,
  };
}

router.post("/register", async (req, res) => {
  try {
    const name = (req.body.name ?? "").trim();
    const email = (req.body.email ?? "").trim().toLowerCase();
    const password = req.body.password ?? "";

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email no válido." });
    }

    if (email === getAdminEmail()) {
      return res.status(400).json({ error: "Este email está reservado para administración." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: STRONG_PASSWORD_MESSAGE });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Ya existe una cuenta con este email." });
    }

    const id = await generateCustomerId(Customer);
    const createdAt = new Date().toISOString();
    const passwordHash = hashPassword(password);

    const customer = await Customer.create({
      id,
      name,
      email,
      passwordHash,
      createdAt,
    });

    await syncCustomerToJson(customer);

    setRoleCookie(res, "customer", customer.id);
    return res.status(201).json({
      ok: true,
      user: stripCustomer(customer),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Ya existe una cuenta con este email." });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "Error al crear la cuenta." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const password = req.body.password ?? "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    }

    if (verifyAdminCredentials(email, password)) {
      setAdminCookie(res);
      return res.json({
        ok: true,
        redirect: "/admin",
        role: "admin",
      });
    }

    const customer = await Customer.findOne({ email });
    if (!customer?.passwordHash || !verifyPassword(password, customer.passwordHash)) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    await syncCustomerToJson(customer);
    setRoleCookie(res, "customer", customer.id);
    return res.json({
      ok: true,
      user: stripCustomer(customer),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

router.post("/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Introduce un email válido." });
    }

    if (email === getAdminEmail()) {
      return res.json({
        ok: true,
        message:
          "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.",
      });
    }

    const customer = await Customer.findOne({ email });
    if (customer?.passwordHash) {
      const token = randomBytes(32).toString("hex");
      const resetTokenHash = hashResetToken(token);
      const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

      await Customer.updateOne(
        { email },
        { $set: { resetTokenHash, resetTokenExpiresAt } }
      );

      const resetUrl = `${getFrontendUrl()}/cuenta/restablecer?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      const result = await sendPasswordResetEmail({ to: email, resetUrl });

      if (!result.sent) {
        console.error("Forgot password email failed:", result.error);
        return res.status(500).json({
          error: "No se pudo enviar el correo. Comprueba la configuración SMTP.",
        });
      }
    }

    return res.json({
      ok: true,
      message:
        "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const token = String(req.body.token ?? "").trim();
    const password = req.body.password ?? "";

    if (!email || !token || !password) {
      return res.status(400).json({ error: "Email, enlace y contraseña son obligatorios." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: STRONG_PASSWORD_MESSAGE });
    }

    const customer = await Customer.findOne({ email });
    if (!customer?.resetTokenHash || !customer?.resetTokenExpiresAt) {
      return res.status(400).json({ error: "El enlace no es válido o ha caducado." });
    }

    if (new Date(customer.resetTokenExpiresAt).getTime() <= Date.now()) {
      await Customer.updateOne(
        { email },
        { $unset: { resetTokenHash: "", resetTokenExpiresAt: "" } }
      );
      return res.status(400).json({ error: "El enlace ha caducado. Solicita uno nuevo." });
    }

    const tokenHash = hashResetToken(token);
    if (tokenHash !== customer.resetTokenHash) {
      return res.status(400).json({ error: "El enlace no es válido o ha caducado." });
    }

    const passwordHash = hashPassword(password);
    await Customer.updateOne(
      { email },
      {
        $set: { passwordHash },
        $unset: { resetTokenHash: "", resetTokenExpiresAt: "" },
      }
    );

    const updated = await Customer.findOne({ email });
    if (updated) {
      await syncCustomerToJson(updated);
    }

    return res.json({
      ok: true,
      message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Error al restablecer la contraseña." });
  }
});

router.post("/logout", (req, res) => {
  clearRoleCookie(res, "customer");
  clearAdminCookie(res);
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  try {
    const customerId = getCustomerIdFromRequest(req);
    if (!customerId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return res.status(401).json({ error: "No autorizado" });
    }

    return res.json({ user: stripCustomer(customer) });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Error al obtener la sesión." });
  }
});

module.exports = router;
