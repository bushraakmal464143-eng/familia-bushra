import { handleCuentaLogin } from "@/lib/cuenta-auth";

export async function POST(request: Request) {
  return handleCuentaLogin(request);
}
