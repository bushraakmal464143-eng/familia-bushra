import { generateId, readJson, writeJson } from "@/lib/json-store";

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
  const existing = await readJson<PartnerContactInquiry[]>("partner-contacts.json", []);
  const record: PartnerContactInquiry = {
    ...inquiry,
    id: generateId("contact", existing),
    createdAt: new Date().toISOString(),
  };
  existing.push(record);
  await writeJson("partner-contacts.json", existing);
  return record;
}

export async function getPartnerContacts(): Promise<PartnerContactInquiry[]> {
  const contacts = await readJson<PartnerContactInquiry[]>("partner-contacts.json", []);
  return contacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
