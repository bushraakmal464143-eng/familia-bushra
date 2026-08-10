import { NextResponse } from "next/server";
import { campingHasRequiredProfileFields } from "@/lib/camping-profile";
import {
  getCampingById,
  stripCampingSecrets,
  updateCamping,
} from "@/lib/campings-store";
import { getSessionSubject } from "@/lib/role-session";

export async function GET() {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const camping = await getCampingById(campingId);
  if (!camping) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(stripCampingSecrets(camping));
}

export async function PATCH(request: Request) {
  const campingId = await getSessionSubject("camping");
  if (!campingId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    location?: string;
    region?: string;
    description?: string;
  };

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const location = body.location?.trim() ?? "";
  const region = body.region?.trim() ?? "";
  const description = body.description?.trim() ?? "";

  if (
    !campingHasRequiredProfileFields({
      name,
      phone,
      location,
      region,
      description,
    })
  ) {
    return NextResponse.json(
      {
        error:
          "Completa nombre, teléfono, localidad, región y descripción para enviar la ficha.",
      },
      { status: 400 }
    );
  }

  const updated = await updateCamping(campingId, {
    name,
    phone,
    location,
    region,
    description,
    profileComplete: true,
  });

  if (!updated) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(stripCampingSecrets(updated));
}
