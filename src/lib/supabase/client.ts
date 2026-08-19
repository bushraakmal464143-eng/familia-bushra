import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return adminClient;
}

export async function nextPrefixedId(
  table: "customers" | "campings" | "bookings" | "contact_inquiries" | "partner_contacts",
  prefix: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(table).select("id");
  if (error) throw error;
  const numeric = (data ?? [])
    .map((row) => parseInt(String(row.id).replace(`${prefix}_`, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : 0;
  return `${prefix}_${max + 1}`;
}

export async function nextOfferId(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("offers").select("id");
  if (error) throw error;
  const numeric = (data ?? [])
    .map((row) => parseInt(String(row.id), 10))
    .filter((n) => !Number.isNaN(n));
  const max = numeric.length ? Math.max(...numeric) : -1;
  return String(max + 1);
}
