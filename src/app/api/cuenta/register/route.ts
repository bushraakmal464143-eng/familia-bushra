import { handleCuentaRegister } from "@/lib/cuenta-auth";

export async function POST(request: Request) {
  return handleCuentaRegister(request);
}
