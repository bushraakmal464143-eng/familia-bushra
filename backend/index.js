require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB, getDB } = require("./db");
const cuentaRoutes = require("./routes/cuenta");
const campingRoutes = require("./routes/camping");

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", async (_req, res) => {
  try {
    const db = getDB();
    const customerCount = await db.collection("customers").countDocuments();
    const campingCount = await db.collection("campings").countDocuments();
    res.json({
      message: "Camping backend is running",
      database: db.databaseName,
      customers: customerCount,
      campings: campingCount,
    });
  } catch {
    res.json({ message: "Camping backend is running (database not ready)" });
  }
});

app.use("/api/cuenta", cuentaRoutes);
app.use("/api/camping", campingRoutes);

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      console.log("MongoDB ready — register users at /api/cuenta/register");
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
