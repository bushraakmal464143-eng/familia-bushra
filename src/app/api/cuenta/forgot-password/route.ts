import { handleCuentaForgotPassword } from "@/lib/cuenta-auth";

export async function POST(request: Request) {
  return handleCuentaForgotPassword(request);
}
