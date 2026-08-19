import { NextResponse } from "next/server";
import { campingHasRequiredProfileFields } from "@/lib/camping-profile";
import {
  createCampingAccount,
  getCampingByEmail,
} from "@/lib/campings-store";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createRoleToken, roleCookieOptions } from "@/lib/role-session";

function clearCampingCookie(response: NextResponse) {
  const opts = roleCookieOptions("camping", "");
  response.cookies.set(opts.name, "", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: 0,
  });
}

export async function handleCampingRegister(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    location?: string;
    region?: string;
    description?: string;
  };

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const phone = body.phone ? String(body.phone).trim() : undefined;
  const location = String(body.location ?? "").trim();
  const region = String(body.region ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  try {
    const existing = await getCampingByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    const profileComplete = campingHasRequiredProfileFields({
      name,
      phone,
      location,
      region,
      description,
    });

    const camping = await createCampingAccount({
      name,
      email,
      passwordHash: hashPassword(password),
      phone,
      location,
      region,
      description,
      profileComplete,
    });

    const response = NextResponse.json({
      ok: true,
      status: camping.status,
      redirect: profileComplete ? "/camping" : "/camping/perfil",
    });
    const opts = roleCookieOptions("camping", createRoleToken("camping", camping.id));
    response.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}

export async function handleCampingLogin(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const camping = await getCampingByEmail(email);
  if (!camping || !verifyPassword(password, camping.passwordHash)) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, campingId: camping.id });
  const opts = roleCookieOptions("camping", createRoleToken("camping", camping.id));
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}

export async function handleCampingLogout() {
  const response = NextResponse.json({ ok: true });
  clearCampingCookie(response);
  return response;
}
