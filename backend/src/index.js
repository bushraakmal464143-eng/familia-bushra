require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDb } = require("./db");

const PORT = Number(process.env.PORT) || 4000;
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function start() {
  await connectDb();

  // Routes depend on DB mode (mongo vs json fallback), so load them after `connectDb()`.
  const cuentaRoutes = require("./routes/cuenta");
  app.use("/api/cuenta", cuentaRoutes);

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
