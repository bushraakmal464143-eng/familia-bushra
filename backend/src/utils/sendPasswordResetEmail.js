const nodemailer = require("nodemailer");

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
    from: user,
  };
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    return { sent: false, error: "SMTP not configured" };
  }

  const subject = "Restablece tu contraseña — OfertasdeCamping.com";
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
    "OfertasdeCamping.com",
  ].join("\n");

  try {
    const transporter =
      smtp.host === "smtp.gmail.com"
        ? nodemailer.createTransport({
            service: "gmail",
            auth: smtp.auth,
          })
        : nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            auth: smtp.auth,
          });

    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      text,
    });

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Password reset email error:", message);
    return { sent: false, error: message };
  }
}

module.exports = { sendPasswordResetEmail };
