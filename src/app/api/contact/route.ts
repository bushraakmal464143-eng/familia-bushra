import { NextResponse } from "next/server";
import { createContactInquiry } from "@/lib/contact-inquiries-store";
import { savePartnerContact } from "@/lib/partner-contacts-store";
import { sendPartnerContactEmail } from "@/lib/send-partner-contact-email";
import { getSiteSettings } from "@/lib/site-settings-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      campsiteName?: string;
      email?: string;
      phone?: string;
      comments?: string;
    };

    const name = body.name?.trim() ?? "";
    const campsiteName = body.campsiteName?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const comments = body.comments?.trim() ?? "";

    if (!name || !campsiteName || !email || !phone) {
      return NextResponse.json(
        { error: "Nombre, camping, email y teléfono son obligatorios." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido." }, { status: 400 });
    }

    await createContactInquiry({
      name,
      campsiteName,
      email,
      phone,
      comments,
    });

    const settings = await getSiteSettings();
    await savePartnerContact({
      name,
      campingName: campsiteName,
      phone,
      email,
      message: comments,
    });
    await sendPartnerContactEmail(settings.contactEmail, {
      name,
      campingName: campsiteName,
      phone,
      email,
      message: comments,
    });

    return NextResponse.json({
      ok: true,
      message: "Gracias. Hemos recibido tu consulta y te contactaremos pronto.",
    });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "No se pudo enviar el formulario. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
