import { readJson, writeJson, generateId } from "@/lib/json-store";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  nextPrefixedId,
} from "@/lib/supabase/client";
import { contactInquiryFromRow } from "@/lib/supabase/mappers";
import type { ContactInquiry } from "@/lib/types";

const FILE = "contact-inquiries.json";

export async function getContactInquiries(): Promise<ContactInquiry[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(contactInquiryFromRow);
  }
  return readJson(FILE, []);
}

export async function createContactInquiry(data: {
  name: string;
  campsiteName: string;
  email: string;
  phone: string;
  comments: string;
}): Promise<ContactInquiry> {
  const inquiry: ContactInquiry = {
    id: isSupabaseConfigured()
      ? await nextPrefixedId("contact_inquiries", "contact")
      : generateId("contact", await readJson(FILE, [])),
    ...data,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin().from("contact_inquiries").insert({
      id: inquiry.id,
      name: inquiry.name,
      campsite_name: inquiry.campsiteName,
      email: inquiry.email,
      phone: inquiry.phone,
      comments: inquiry.comments,
      created_at: inquiry.createdAt,
    });
    if (error) throw error;
    return inquiry;
  }

  const inquiries = await readJson<ContactInquiry[]>(FILE, []);
  inquiries.push(inquiry);
  await writeJson(FILE, inquiries);
  return inquiry;
}
