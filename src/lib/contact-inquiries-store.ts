import { readJson, writeJson, generateId } from "@/lib/json-store";
import type { ContactInquiry } from "@/lib/types";

const FILE = "contact-inquiries.json";

export async function getContactInquiries(): Promise<ContactInquiry[]> {
  return readJson(FILE, []);
}

export async function createContactInquiry(data: {
  name: string;
  campsiteName: string;
  email: string;
  phone: string;
  comments: string;
}): Promise<ContactInquiry> {
  const inquiries = await getContactInquiries();
  const inquiry: ContactInquiry = {
    id: generateId("contact", inquiries),
    ...data,
    createdAt: new Date().toISOString(),
  };
  inquiries.push(inquiry);
  await writeJson(FILE, inquiries);
  return inquiry;
}
