import { handleCuentaResetPassword } from "@/lib/cuenta-auth";

export async function POST(request: Request) {
  return handleCuentaResetPassword(request);
}
