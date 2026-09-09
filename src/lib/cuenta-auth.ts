import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  clearSessionCookieOptions,
  getAdminEmail,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { createSessionToken } from "@/lib/admin-session";
import { recordAuthEvent } from "@/lib/auth-events-store";
import {
  createCustomer,
  getCustomerByEmail,
  getCustomerById,
  touchCustomerLogin,
  updateCustomerByEmail,
} from "@/lib/customers-store";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  isStrongPassword,
  STRONG_PASSWORD_MESSAGE,
} from "@/lib/password-rules";
import { createRoleToken, roleCookieOptions } from "@/lib/role-session";
import { sendPasswordResetEmail } from "@/lib/send-password-reset-email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function stripCustomer(customer: {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    createdAt: customer.createdAt,
  };
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function frontendUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function handleCuentaRegister(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña son obligatorios." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email no válido." }, { status: 400 });
  }
  if (email === getAdminEmail()) {
    return NextResponse.json(
      { error: "Este email está reservado para administración." },
      { status: 400 }
    );
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: STRONG_PASSWORD_MESSAGE }, { status: 400 });
  }

  try {
    const existing = await getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email." },
        { status: 409 }
      );
    }

    const customer = await createCustomer({
      name,
      email,
      passwordHash: hashPassword(password),
    });

    await recordAuthEvent({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      eventType: "signup",
      method: "email",
    });
    await touchCustomerLogin(customer.id);

    const response = NextResponse.json(
      { ok: true, user: stripCustomer(customer) },
      { status: 201 }
    );
    const opts = roleCookieOptions("customer", createRoleToken("customer", customer.id));
    response.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Error al crear la cuenta." }, { status: 500 });
  }
}

export async function handleCuentaLogin(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios." },
      { status: 400 }
    );
  }

  if (verifyAdminCredentials(email, password)) {
    const response = NextResponse.json({
      ok: true,
      redirect: "/admin",
      role: "admin",
    });
    const opts = sessionCookieOptions(createSessionToken());
    response.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    return response;
  }

  const customer = await getCustomerByEmail(email);
  if (!customer?.passwordHash || !verifyPassword(password, customer.passwordHash)) {
    return NextResponse.json(
      { error: "Email o contraseña incorrectos." },
      { status: 401 }
    );
  }

  await recordAuthEvent({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
    eventType: "login",
    method: "email",
  });
  await touchCustomerLogin(customer.id);

  const response = NextResponse.json({ ok: true, user: stripCustomer(customer) });
  const opts = roleCookieOptions("customer", createRoleToken("customer", customer.id));
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}

export async function handleCuentaForgotPassword(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Introduce un email válido." }, { status: 400 });
  }

  if (email !== getAdminEmail()) {
    const customer = await getCustomerByEmail(email);
    if (customer?.passwordHash) {
      const token = randomBytes(32).toString("hex");
      await updateCustomerByEmail(email, {
        resetTokenHash: hashResetToken(token),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
      });
      const resetUrl = `${frontendUrl(request)}/cuenta/restablecer?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      const result = await sendPasswordResetEmail({ to: email, resetUrl });
      if (!result.sent) {
        return NextResponse.json(
          { error: "No se pudo enviar el correo. Comprueba la configuración SMTP." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    message:
      "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.",
  });
}

export async function handleCuentaResetPassword(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    token?: string;
    password?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const token = String(body.token ?? "").trim();
  const password = body.password ?? "";

  if (!email || !token || !password) {
    return NextResponse.json(
      { error: "Email, enlace y contraseña son obligatorios." },
      { status: 400 }
    );
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: STRONG_PASSWORD_MESSAGE }, { status: 400 });
  }

  const customer = await getCustomerByEmail(email);
  const resetHash = (customer as { resetTokenHash?: string })?.resetTokenHash;
  const resetExpires = (customer as { resetTokenExpiresAt?: string })
    ?.resetTokenExpiresAt;

  if (!resetHash || !resetExpires) {
    return NextResponse.json(
      { error: "El enlace no es válido o ha caducado." },
      { status: 400 }
    );
  }
  if (new Date(resetExpires).getTime() <= Date.now()) {
    await updateCustomerByEmail(email, {
      resetTokenHash: undefined,
      resetTokenExpiresAt: undefined,
    });
    return NextResponse.json(
      { error: "El enlace ha caducado. Solicita uno nuevo." },
      { status: 400 }
    );
  }
  if (hashResetToken(token) !== resetHash) {
    return NextResponse.json(
      { error: "El enlace no es válido o ha caducado." },
      { status: 400 }
    );
  }

  await updateCustomerByEmail(email, {
    passwordHash: hashPassword(password),
    resetTokenHash: undefined,
    resetTokenExpiresAt: undefined,
  });

  return NextResponse.json({
    ok: true,
    message: "Contraseña actualizada. Ya puedes iniciar sesión.",
  });
}

export async function handleCuentaLogout() {
  const response = NextResponse.json({ ok: true });
  const customerClear = roleCookieOptions("customer", "");
  response.cookies.set(customerClear.name, "", { ...customerClear, maxAge: 0 });
  const adminClear = clearSessionCookieOptions();
  response.cookies.set(adminClear.name, "", { ...adminClear, maxAge: 0 });
  return response;
}

export async function handleCuentaMe(customerId: string) {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ user: stripCustomer(customer) });
}
