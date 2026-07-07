const express = require("express");
const { getDB } = require("../db");
const {
  hashPassword,
  verifyPassword,
  createRoleToken,
  setRoleCookie,
  clearRoleCookie,
  generateId,
} = require("../auth");

const router = express.Router();

// POST /api/cuenta/register — customer sign up (signup page)
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    }

    const db = getDB();
    const customers = db.collection("customers");

    const existing = await customers.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Este email ya está registrado" });
    }

    const customer = {
      id: await generateId(customers, "cust"),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await customers.insertOne(customer);

    const token = createRoleToken("customer", customer.id);
    setRoleCookie(res, "customer", token);

    res.json({ ok: true });
  } catch (err) {
    console.error("Register customer error:", err);
    res.status(500).json({ error: "Error al registrar" });
  }
});

// POST /api/cuenta/login — customer login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    const db = getDB();
    const customer = await db.collection("customers").findOne({ email });

    if (
      !customer ||
      !customer.passwordHash ||
      !verifyPassword(password, customer.passwordHash)
    ) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = createRoleToken("customer", customer.id);
    setRoleCookie(res, "customer", token);
    res.json({ ok: true });
  } catch (err) {
    console.error("Login customer error:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// POST /api/cuenta/logout
router.post("/logout", (_req, res) => {
  clearRoleCookie(res, "customer");
  res.json({ ok: true });
});

module.exports = router;
