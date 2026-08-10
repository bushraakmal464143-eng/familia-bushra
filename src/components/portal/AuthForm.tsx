"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import GoogleSignInButton from "@/components/portal/GoogleSignInButton";
import LoginPageShell from "@/components/LoginPageShell";
import PasswordInput from "@/components/PasswordInput";
import {
  isStrongPassword,
  STRONG_PASSWORD_MESSAGE,
} from "@/lib/password-rules";

type AuthFormProps = {
  title: string;
  subtitle: string;
  apiPath: string;
  registerPath?: string;
  registerLabel?: string;
  fields: "login" | "register-camping" | "register-customer";
  showGoogleLogin?: boolean;
  googleSignInEnabled?: boolean;
};

function AuthFormInner({
  title,
  subtitle,
  apiPath,
  registerPath,
  registerLabel,
  fields,
  showGoogleLogin = false,
  googleSignInEnabled = true,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";
  const oauthError = searchParams.get("error");
  const [error, setError] = useState<string | null>(() => {
    if (oauthError === "google_denied") return "Has cancelado el inicio con Google.";
    if (oauthError === "google_failed" || oauthError === "google_invalid_state") {
      return "No se pudo iniciar sesión con Google. Inténtalo de nuevo.";
    }
    if (oauthError === "google_not_configured") {
      return "Inicio con Google no está configurado en el servidor.";
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      (fields === "register-customer" || fields === "register-camping") &&
      !isStrongPassword(password)
    ) {
      setError(STRONG_PASSWORD_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, string> = { email, password };
      if (fields === "register-customer") body.name = name;
      if (fields === "register-camping") {
        body.name = name;
      }

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      const data = (await res.json()) as { redirect?: string };
      let destination = data.redirect;
      if (!destination) {
        if (apiPath.includes("/camping/")) {
          destination =
            fields === "register-camping" ? "/camping/perfil" : "/camping";
        } else if (from.startsWith("/admin")) {
          destination = "/admin";
        } else {
          destination = from;
        }
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError(
        "No se pudo conectar con el servidor. Comprueba que el backend esté en marcha (puerto 4000)."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

  return (
    <LoginPageShell>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-brand-forest">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {(fields === "register-camping" || fields === "register-customer") && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                {fields === "register-camping" ? "Nombre del camping" : "Nombre"}
              </label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  fields === "register-camping"
                    ? "Ej. Camping Valle Verde"
                    : undefined
                }
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <PasswordInput
              label="Contraseña"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={fields === "login" ? 1 : 8}
            />
            {fields !== "login" && (
              <p className="mt-1 text-xs text-gray-500">{STRONG_PASSWORD_MESSAGE}</p>
            )}
            {fields === "login" && apiPath.includes("/cuenta/") && (
              <p className="mt-2 text-right text-sm">
                <Link
                  href="/cuenta/recuperar"
                  className="font-medium text-brand-accent hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            )}
          </div>

          {fields === "register-camping" && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Tras registrarte completarás la ficha del camping. Un administrador
              revisará tu alta antes de que puedas publicar ofertas.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading
              ? "Espera…"
              : fields === "login"
                ? "Entrar"
                : fields === "register-camping"
                  ? "Crear cuenta de camping"
                  : "Crear cuenta"}
          </button>
        </form>

        {showGoogleLogin &&
          (fields === "login" || fields === "register-customer") && (
          <div className="mt-6">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">o</span>
              </div>
            </div>
            <GoogleSignInButton from={from} enabled={googleSignInEnabled} />
          </div>
        )}

        {registerPath && fields === "login" && (
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href={registerPath} className="font-medium text-brand-accent hover:underline">
              {registerLabel}
            </Link>
          </p>
        )}
        {fields !== "login" && (
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href={apiPath.includes("camping") ? "/camping/login" : "/cuenta/login"} className="font-medium text-brand-accent hover:underline">
              Iniciar sesión
            </Link>
          </p>
        )}
      </div>
    </LoginPageShell>
  );
}

export default function AuthForm(props: AuthFormProps) {
  return (
    <Suspense
      fallback={
        <LoginPageShell>
          <p className="text-gray-500">Cargando…</p>
        </LoginPageShell>
      }
    >
      <AuthFormInner {...props} />
    </Suspense>
  );
}
