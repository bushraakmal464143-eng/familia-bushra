import { NextResponse } from "next/server";
import { savePartnerContact } from "@/lib/partner-contacts-store";
import { sendPartnerContactEmail } from "@/lib/send-partner-contact-email";
import { getSiteSettings } from "@/lib/site-settings-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      campingName?: string;
      phone?: string;
      email?: string;
      message?: string;
    };

    const name = body.name?.trim() ?? "";
    const campingName = body.campingName?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (!name || !campingName || !phone || !email) {
      return NextResponse.json(
        { error: "Nombre, camping, teléfono y email son obligatorios." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido." }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const inquiry = { name, campingName, phone, email, message };

    await savePartnerContact(inquiry);
    const emailResult = await sendPartnerContactEmail(settings.contactEmail, inquiry);

    return NextResponse.json({
      ok: true,
      emailSent: emailResult.sent,
      message: "Gracias. Hemos recibido tu consulta y te contactaremos pronto.",
    });
  } catch (err) {
    console.error("Partner contact error:", err);
    return NextResponse.json(
      { error: "No se pudo guardar la consulta. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
