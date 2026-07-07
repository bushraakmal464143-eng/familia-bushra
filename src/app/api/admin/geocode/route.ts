import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "OfertasdeCamping-Admin/1.0",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "No se pudo buscar la ubicación." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
    }>;

    const results = data.map((item) => ({
      id: String(item.place_id),
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      type: item.type ?? "place",
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Error de conexión al buscar ubicaciones." },
      { status: 502 }
    );
  }
}
