const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "..", "data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readCustomersJson() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(CUSTOMERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCustomersJson(customers) {
  await ensureDataDir();
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
}

async function syncCustomerToJson(customer) {
  const customers = await readCustomersJson();
  const index = customers.findIndex((c) => c.id === customer.id);
  const entry = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    passwordHash: customer.passwordHash,
    googleId: customer.googleId,
    createdAt: customer.createdAt,
  };
  if (index >= 0) {
    customers[index] = entry;
  } else {
    customers.push(entry);
  }
  await writeCustomersJson(customers);
}

async function generateCustomerId(CustomerModel) {
  const [jsonCustomers, mongoCustomers] = await Promise.all([
    readCustomersJson(),
    CustomerModel.find({}, { id: 1 }).lean(),
  ]);
  const allIds = [
    ...jsonCustomers.map((c) => c.id),
    ...mongoCustomers.map((c) => c.id),
  ];
  const numeric = allIds
    .map((id) => id.replace("cust_", ""))
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : 0;
  return `cust_${max + 1}`;
}

module.exports = { syncCustomerToJson, generateCustomerId };
