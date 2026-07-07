import type { PartnerContactInquiry } from "@/lib/partner-contacts-store";
import { SITE_NAME } from "@/lib/site";

type SendResult = { sent: boolean; error?: string };

export async function sendPartnerContactEmail(
  to: string,
  inquiry: Omit<PartnerContactInquiry, "id" | "createdAt">
): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return { sent: false, error: "SMTP not configured" };
  }

  const subject = `Consulta camping/glamping — ${inquiry.campingName || inquiry.name}`;
  const text = [
    `Nombre: ${inquiry.name}`,
    `Camping / glamping: ${inquiry.campingName}`,
    `Teléfono: ${inquiry.phone}`,
    `Email: ${inquiry.email}`,
    "",
    inquiry.message ||
      `Me interesa publicar mi establecimiento en ${SITE_NAME}.`,
  ].join("\n");

  try {
    const nodemailer = await import("nodemailer");
    const transporter =
      host === "smtp.gmail.com"
        ? nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass },
          })
        : nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: { user, pass },
          });

    await transporter.sendMail({
      from: user,
      to,
      replyTo: inquiry.email,
      subject,
      text,
    });

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Partner contact email error:", message);
    return { sent: false, error: message };
  }
}
