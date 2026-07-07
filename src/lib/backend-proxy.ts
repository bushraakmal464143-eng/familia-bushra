import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function proxyToBackend(
  request: Request,
  path: string
): Promise<NextResponse> {
  const url = `${backendUrl}${path}`;
  const method = request.method.toUpperCase();
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo conectar con el servidor. Comprueba que el backend esté en marcha (puerto 4000).",
      },
      { status: 503 }
    );
  }

  const body = await upstream.text();
  const response = new NextResponse(body, { status: upstream.status });

  const responseType = upstream.headers.get("content-type");
  if (responseType) {
    response.headers.set("content-type", responseType);
  }

  if (typeof upstream.headers.getSetCookie === "function") {
    for (const value of upstream.headers.getSetCookie()) {
      response.headers.append("set-cookie", value);
    }
  } else {
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);
  }

  return response;
}
