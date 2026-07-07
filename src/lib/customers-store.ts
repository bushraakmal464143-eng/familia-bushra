import { readJson, writeJson, generateId } from "@/lib/json-store";
import { hashPassword } from "@/lib/password";
import type { Customer } from "@/lib/types";

const FILE = "customers.json";

export async function getCustomers(): Promise<Customer[]> {
  return readJson(FILE, []);
}

export async function saveCustomers(customers: Customer[]): Promise<void> {
  await writeJson(FILE, customers);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const customers = await getCustomers();
  return customers.find((c) => c.id === id);
}

export async function getCustomerByEmail(
  email: string
): Promise<Customer | undefined> {
  const normalized = email.trim().toLowerCase();
  const customers = await getCustomers();
  return customers.find((c) => c.email.toLowerCase() === normalized);
}

export async function findOrCreateCustomerFromGoogle(profile: {
  googleId: string;
  email: string;
  name: string;
}): Promise<Customer> {
  const customers = await getCustomers();
  const byGoogle = customers.find((c) => c.googleId === profile.googleId);
  if (byGoogle) return byGoogle;

  const byEmail = customers.find(
    (c) => c.email.toLowerCase() === profile.email.toLowerCase()
  );
  if (byEmail) {
    byEmail.googleId = profile.googleId;
    if (profile.name) byEmail.name = profile.name;
    await saveCustomers(customers);
    return byEmail;
  }

  const customer: Customer = {
    id: generateId("cust", customers),
    name: profile.name,
    email: profile.email,
    googleId: profile.googleId,
    createdAt: new Date().toISOString(),
  };
  customers.push(customer);
  await saveCustomers(customers);
  return customer;
}

export async function registerCustomer(data: {
  name: string;
  email: string;
  password: string;
}): Promise<Customer> {
  const customers = await getCustomers();
  if (customers.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  const customer: Customer = {
    id: generateId("cust", customers),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: hashPassword(data.password),
    createdAt: new Date().toISOString(),
  };
  customers.push(customer);
  await saveCustomers(customers);
  return customer;
}

export function stripCustomerSecrets(customer: Customer) {
  const { passwordHash: _, ...safe } = customer;
  return safe;
}
