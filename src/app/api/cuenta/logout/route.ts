import { handleCuentaLogout } from "@/lib/cuenta-auth";

export async function POST() {
  return handleCuentaLogout();
}
