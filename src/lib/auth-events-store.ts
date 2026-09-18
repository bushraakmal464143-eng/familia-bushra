import { readJson, writeJson, generateId } from "@/lib/json-store";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AuthEvent, AuthEventMethod, AuthEventType } from "@/lib/types";

const FILE = "auth-events.json";

type AuthEventRow = {
  id: number | string;
  customer_id: string | null;
  email: string;
  name: string | null;
  event_type: AuthEventType;
  method: AuthEventMethod;
  created_at: string;
};

function fromRow(row: AuthEventRow): AuthEvent {
  return {
    id: String(row.id),
    customerId: row.customer_id ?? undefined,
    email: row.email,
    name: row.name ?? undefined,
    eventType: row.event_type,
    method: row.method,
    createdAt: row.created_at,
  };
}

export async function recordAuthEvent(input: {
  customerId?: string;
  email: string;
  name?: string;
  eventType: AuthEventType;
  method: AuthEventMethod;
}): Promise<void> {
  const createdAt = new Date().toISOString();

  try {
    if (isSupabaseConfigured()) {
      const { error } = await getSupabaseAdmin().from("auth_events").insert({
        customer_id: input.customerId ?? null,
        email: input.email.trim().toLowerCase(),
        name: input.name?.trim() || null,
        event_type: input.eventType,
        method: input.method,
        created_at: createdAt,
      });
      if (error) {
        console.error("[auth_events] insert failed:", error.message);
      }
      return;
    }

    const events = await readJson<AuthEvent[]>(FILE, []);
    events.push({
      id: generateId("auth", events),
      customerId: input.customerId,
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim() || undefined,
      eventType: input.eventType,
      method: input.method,
      createdAt,
    });
    await writeJson(FILE, events);
  } catch (err) {
    console.error("[auth_events] record failed:", err);
  }
}

export async function getAuthEvents(limit = 100): Promise<AuthEvent[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabaseAdmin()
        .from("auth_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        console.error("[auth_events] list failed:", error.message);
        return [];
      }
      return ((data ?? []) as AuthEventRow[]).map(fromRow);
    }

    const events = await readJson<AuthEvent[]>(FILE, []);
    return [...events]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch (err) {
    console.error("[auth_events] list failed:", err);
    return [];
  }
}

export async function getAuthEventsForCustomer(
  customerId: string,
  limit = 50
): Promise<AuthEvent[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabaseAdmin()
        .from("auth_events")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        console.error("[auth_events] customer list failed:", error.message);
        return [];
      }
      return ((data ?? []) as AuthEventRow[]).map(fromRow);
    }

    const events = await readJson<AuthEvent[]>(FILE, []);
    return events
      .filter((e) => e.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch (err) {
    console.error("[auth_events] customer list failed:", err);
    return [];
  }
}
