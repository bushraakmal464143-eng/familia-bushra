import { readJson, writeJson, generateId } from "@/lib/json-store";
import { hashPassword } from "@/lib/password";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  nextPrefixedId,
} from "@/lib/supabase/client";
import {
  customerFromRow,
  customerToRow,
  type CustomerRow,
} from "@/lib/supabase/mappers";
import type { Customer } from "@/lib/types";

const FILE = "customers.json";

type CustomerWithReset = Customer & {
  resetTokenHash?: string;
  resetTokenExpiresAt?: string;
};

async function sbGetCustomers(): Promise<CustomerWithReset[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("customers")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as CustomerRow[]).map(customerFromRow);
}

export async function getCustomers(): Promise<Customer[]> {
  if (isSupabaseConfigured()) return sbGetCustomers();
  return readJson(FILE, []);
}

export async function saveCustomers(customers: Customer[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const rows = customers.map((c) => customerToRow(c));
    const { error } = await getSupabaseAdmin()
      .from("customers")
      .upsert(rows, { onConflict: "id" });
    if (error) throw error;
    return;
  }
  await writeJson(FILE, customers);
}

export async function getCustomerById(
  id: string
): Promise<CustomerWithReset | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? customerFromRow(data as CustomerRow) : undefined;
  }
  const customers = await readJson<CustomerWithReset[]>(FILE, []);
  return customers.find((c) => c.id === id);
}

export async function getCustomerByEmail(
  email: string
): Promise<CustomerWithReset | undefined> {
  const normalized = email.trim().toLowerCase();
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("customers")
      .select("*")
      .eq("email", normalized)
      .maybeSingle();
    if (error) throw error;
    return data ? customerFromRow(data as CustomerRow) : undefined;
  }
  const customers = await readJson<CustomerWithReset[]>(FILE, []);
  return customers.find((c) => c.email.toLowerCase() === normalized);
}

export async function createCustomer(data: {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
}): Promise<Customer> {
  const customer: CustomerWithReset = {
    id: isSupabaseConfigured()
      ? await nextPrefixedId("customers", "cust")
      : generateId("cust", await readJson(FILE, [])),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: data.passwordHash,
    googleId: data.googleId,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("customers")
      .insert(customerToRow(customer));
    if (error) throw error;
    return customer;
  }

  const customers = await readJson<CustomerWithReset[]>(FILE, []);
  customers.push(customer);
  await writeJson(FILE, customers);
  return customer;
}

export async function updateCustomerByEmail(
  email: string,
  patch: Partial<{
    name: string;
    passwordHash: string;
    googleId: string;
    resetTokenHash: string | undefined;
    resetTokenExpiresAt: string | undefined;
  }>
): Promise<CustomerWithReset | undefined> {
  const normalized = email.trim().toLowerCase();
  const current = await getCustomerByEmail(normalized);
  if (!current) return undefined;

  const updated: CustomerWithReset = { ...current, ...patch };
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("customers")
      .update(customerToRow(updated))
      .eq("email", normalized);
    if (error) throw error;
    return updated;
  }

  const customers = await readJson<CustomerWithReset[]>(FILE, []);
  const index = customers.findIndex((c) => c.email.toLowerCase() === normalized);
  if (index < 0) return undefined;
  customers[index] = updated;
  await writeJson(FILE, customers);
  return updated;
}

export async function findOrCreateCustomerFromGoogle(profile: {
  googleId: string;
  email: string;
  name: string;
}): Promise<Customer> {
  const byGoogle = isSupabaseConfigured()
    ? await (async () => {
        const { data } = await getSupabaseAdmin()
          .from("customers")
          .select("*")
          .eq("google_id", profile.googleId)
          .maybeSingle();
        return data ? customerFromRow(data as CustomerRow) : undefined;
      })()
    : (await readJson<CustomerWithReset[]>(FILE, [])).find(
        (c) => c.googleId === profile.googleId
      );

  if (byGoogle) return byGoogle;

  const byEmail = await getCustomerByEmail(profile.email);
  if (byEmail) {
    return (await updateCustomerByEmail(profile.email, {
      googleId: profile.googleId,
      name: profile.name || byEmail.name,
    }))!;
  }

  return createCustomer({
    name: profile.name,
    email: profile.email,
    googleId: profile.googleId,
  });
}

export async function registerCustomer(data: {
  name: string;
  email: string;
  password: string;
}): Promise<Customer> {
  const existing = await getCustomerByEmail(data.email);
  if (existing) throw new Error("EMAIL_EXISTS");
  return createCustomer({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
  });
}

export function stripCustomerSecrets(customer: Customer) {
  const { passwordHash: _, ...safe } = customer;
  return safe;
}
