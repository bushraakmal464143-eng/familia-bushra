import nodemailer from "nodemailer";

type SendResult = { sent: boolean; error?: string };

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return { sent: false, error: "SMTP not configured" };
  }

  const subject = "Restablece tu contraseña — OfertasdeCampingyHoteles.com";
  const text = [
    "Hola,",
    "",
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta.",
    "Si fuiste tú, abre este enlace en tu navegador:",
    "",
    resetUrl,
    "",
    "El enlace caduca en 1 hora. Si no solicitaste este cambio, ignora este correo.",
    "",
    "OfertasdeCampingyHoteles.com",
  ].join("\n");

  try {
    const transporter =
      host === "smtp.gmail.com"
        ? nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
        : nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: { user, pass },
          });

    await transporter.sendMail({ from: user, to, subject, text });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Password reset email error:", message);
    return { sent: false, error: message };
  }
}
