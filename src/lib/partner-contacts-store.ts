import { generateId, readJson, writeJson } from "@/lib/json-store";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  nextPrefixedId,
} from "@/lib/supabase/client";
import { partnerContactFromRow } from "@/lib/supabase/mappers";

export type PartnerContactInquiry = {
  id: string;
  name: string;
  campingName: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
};

export async function savePartnerContact(
  inquiry: Omit<PartnerContactInquiry, "id" | "createdAt">
): Promise<PartnerContactInquiry> {
  const record: PartnerContactInquiry = {
    ...inquiry,
    id: isSupabaseConfigured()
      ? await nextPrefixedId("partner_contacts", "contact")
      : generateId("contact", await readJson("partner-contacts.json", [])),
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin().from("partner_contacts").insert({
      id: record.id,
      name: record.name,
      camping_name: record.campingName,
      phone: record.phone,
      email: record.email,
      message: record.message,
      created_at: record.createdAt,
    });
    if (error) throw error;
    return record;
  }

  const existing = await readJson<PartnerContactInquiry[]>("partner-contacts.json", []);
  existing.push(record);
  await writeJson("partner-contacts.json", existing);
  return record;
}

export async function getPartnerContacts(): Promise<PartnerContactInquiry[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("partner_contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(partnerContactFromRow);
  }
  const contacts = await readJson<PartnerContactInquiry[]>("partner-contacts.json", []);
  return contacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
