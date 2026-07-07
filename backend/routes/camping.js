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

// POST /api/camping/register — camping owner sign up
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const phone = req.body?.phone ? String(req.body.phone).trim() : undefined;
    const location = String(req.body?.location ?? "").trim();
    const region = String(req.body?.region ?? "").trim();
    const description = String(req.body?.description ?? "").trim();

    if (!name || !email || !password || !location || !region) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const db = getDB();
    const campings = db.collection("campings");

    const existing = await campings.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Este email ya está registrado" });
    }

    const camping = {
      id: await generateId(campings, "camp"),
      name,
      email,
      passwordHash: hashPassword(password),
      phone,
      location,
      region,
      description,
      photos: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await campings.insertOne(camping);

    const token = createRoleToken("camping", camping.id);
    setRoleCookie(res, "camping", token);

    res.json({ ok: true, status: camping.status });
  } catch (err) {
    console.error("Register camping error:", err);
    res.status(500).json({ error: "Error al registrar" });
  }
});

// POST /api/camping/login — camping owner login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    const db = getDB();
    const camping = await db.collection("campings").findOne({ email });

    if (!camping || !verifyPassword(password, camping.passwordHash)) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = createRoleToken("camping", camping.id);
    setRoleCookie(res, "camping", token);
    res.json({ ok: true, campingId: camping.id });
  } catch (err) {
    console.error("Login camping error:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// POST /api/camping/logout
router.post("/logout", (_req, res) => {
  clearRoleCookie(res, "camping");
  res.json({ ok: true });
});

module.exports = router;
