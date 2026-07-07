import { getCustomerById } from "@/lib/customers-store";
import { getSessionSubject } from "@/lib/role-session";

export type CurrentCustomer = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const id = await getSessionSubject("customer");
  if (!id) return null;

  const customer = await getCustomerById(id);
  if (!customer) return null;

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
  };
}
