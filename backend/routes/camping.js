const express = require("express");
const fs = require("fs/promises");
const path = require("path");
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

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const CAMPINGS_FILE = path.join(DATA_DIR, "campings.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function buildSeedCampings() {
  const demoHash = hashPassword("camping123");
  return [
    {
      id: "camp_1",
      name: "Camping Vidrà",
      email: "vidra@demo.campolibres",
      phone: "972 000 001",
      location: "Vidrà",
      region: "Girona, España",
      description: "Bungalows y parcelas en plena naturaleza.",
      photos: ["/offers/cabin-style.png"],
      status: "active",
      createdAt: "2026-01-15T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_2",
      name: "Camping Valle Alto",
      email: "valle@demo.campolibres",
      location: "Benasque",
      region: "Huesca, Pirineos",
      description: "Vistas a la montaña y rutas de senderismo.",
      photos: ["/offers/pirineos-2.png"],
      status: "active",
      createdAt: "2026-02-01T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_3",
      name: "Eco Glamp Sierra",
      email: "glamp@demo.campolibres",
      location: "Monachil",
      region: "Granada",
      description: "Glamping de lujo bajo las estrellas.",
      photos: ["/offers/third-offer.png"],
      status: "active",
      createdAt: "2026-02-10T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_4",
      name: "Lago Azul Camping",
      email: "lago@demo.campolibres",
      location: "Riaño",
      region: "León, Picos de Europa",
      description: "Camping familiar junto al lago.",
      photos: ["/offers/lago-azul.png"],
      status: "active",
      createdAt: "2026-03-01T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_5",
      name: "Altura 1800 Camping",
      email: "altura@demo.campolibres",
      location: "Cerler",
      region: "Huesca",
      description: "Camping de altura para 4x4 y autocaravanas.",
      photos: ["/offers/altura-1800.png"],
      status: "pending",
      createdAt: "2026-05-20T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_6",
      name: "Monte Verde Spa Camping",
      email: "spa@demo.campolibres",
      location: "La Molina",
      region: "Girona, Pirineos",
      description: "Wellness, spa y yoga al amanecer.",
      photos: ["/offers/monte-verde.png"],
      status: "active",
      createdAt: "2026-01-20T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_7",
      name: "Camping Playa Dorada",
      email: "playa@demo.campolibres",
      location: "Málaga",
      region: "Andalucía, Costa del Sol",
      description: "Parcelas y bungalows a primera línea de playa.",
      photos: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "active",
      createdAt: "2026-03-15T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_8",
      name: "Camping Costa Brava Mar",
      email: "costa@demo.campolibres",
      location: "Palafrugell",
      region: "Girona, Costa Brava",
      description: "Bungalows familiares junto al Mediterráneo.",
      photos: [
        "https://images.unsplash.com/photo-1519046904214-96b29bb1ca8b?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "active",
      createdAt: "2026-03-20T10:00:00.000Z",
      passwordHash: demoHash,
    },
    {
      id: "camp_9",
      name: "Camping Mar Azul",
      email: "marazul@demo.campolibres",
      location: "Águilas",
      region: "Murcia, Costa Cálida",
      description: "Glamping frente al mar en la Costa Cálida.",
      photos: [
        "https://images.unsplash.com/photo-1473496163314-62a4b58ea781?auto=format&fit=crop&w=1200&q=80",
      ],
      status: "active",
      createdAt: "2026-04-01T10:00:00.000Z",
      passwordHash: demoHash,
    },
  ];
}

async function readCampingsJson() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(CAMPINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  const seeded = buildSeedCampings();
  await fs.writeFile(CAMPINGS_FILE, JSON.stringify(seeded, null, 2), "utf-8");
  return seeded;
}

async function writeCampingsJson(campings) {
  await ensureDataDir();
  await fs.writeFile(CAMPINGS_FILE, JSON.stringify(campings, null, 2), "utf-8");
}

function generateCampingIdFromArray(campings) {
  const numeric = (campings ?? [])
    .map((c) => String(c?.id ?? ""))
    .map((id) => parseInt(id.replace("camp_", ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : 0;
  return `camp_${max + 1}`;
}

// POST /api/camping/register — camping owner sign up
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");
    const phone = req.body?.phone ? String(req.body.phone).trim() : undefined;
    const location = String(req.body?.location ?? "").trim();
    const region = String(req.body?.region ?? "").trim();
    const description = String(req.body?.description ?? "").trim();

    if (!name || !email || !password || !location || !region) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (process.env.DB_MODE === "json") {
      const campings = await readCampingsJson();
      if (campings.some((c) => normalizeEmail(c.email) === email)) {
        return res.status(409).json({ error: "Este email ya está registrado" });
      }

      const camping = {
        id: generateCampingIdFromArray(campings),
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

      campings.push(camping);
      await writeCampingsJson(campings);

      const token = createRoleToken("camping", camping.id);
      setRoleCookie(res, "camping", token);
      return res.json({ ok: true, status: camping.status });
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
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");

    if (process.env.DB_MODE === "json") {
      const campings = await readCampingsJson();
      const camping = campings.find((c) => normalizeEmail(c.email) === email);
      if (!camping || !verifyPassword(password, camping.passwordHash)) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
      const token = createRoleToken("camping", camping.id);
      setRoleCookie(res, "camping", token);
      return res.json({ ok: true, campingId: camping.id });
    }

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
