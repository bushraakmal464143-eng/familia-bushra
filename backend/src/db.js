const mongoose = require("mongoose");

async function migrateFromOldDatabase() {
  const client = mongoose.connection.getClient();
  const targetDb = mongoose.connection.db;
  const oldDb = client.db("courses");
  const oldCustomers = await oldDb.collection("customers").find().toArray();
  if (oldCustomers.length === 0) return;

  const existingEmails = new Set(
    (await targetDb.collection("customers").find({}, { projection: { email: 1 } }).toArray())
      .map((c) => c.email)
  );

  const toInsert = oldCustomers.filter((c) => !existingEmails.has(c.email));
  if (toInsert.length === 0) return;

  await targetDb.collection("customers").insertMany(toInsert, { ordered: false });
  console.log(
    `Migrated ${toInsert.length} user(s) from "courses" to "familiaproject"`
  );
}

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in backend/.env");
  }

  try {
    await mongoose.connect(uri);
    process.env.DB_MODE = "mongo";
  } catch (err) {
    // Local dev fallback: if MongoDB isn't reachable, keep the API running
    // using the JSON file store (see `models/Customer.js`).
    process.env.DB_MODE = "json";
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      [
        "MongoDB not reachable; starting API in JSON DB mode.",
        `MONGODB_URI=${uri}`,
        `Error: ${msg}`,
      ].join(" ")
    );
    return;
  }

  await migrateFromOldDatabase();

  const dbName = mongoose.connection.db.databaseName;
  const count = await mongoose.connection.db.collection("customers").countDocuments();
  console.log("MongoDB connected");
  console.log(`  Compass → database: "${dbName}" → collection: "customers" (${count} users)`);
}

module.exports = { connectDb };
