"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import LoginPageShell from "@/components/LoginPageShell";
import PasswordInput from "@/components/PasswordInput";
import {
  isStrongPassword,
  STRONG_PASSWORD_MESSAGE,
} from "@/lib/password-rules";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token || !email) {
      setError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(STRONG_PASSWORD_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/cuenta/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo restablecer la contraseña.");
        return;
      }

      setMessage(data.message ?? "Contraseña actualizada. Ya puedes iniciar sesión.");
      window.setTimeout(() => router.push("/cuenta/login"), 2000);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Comprueba que el backend esté en marcha (puerto 4000)."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <LoginPageShell>
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-brand-forest">Enlace no válido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Este enlace de recuperación no es válido o ha caducado.
          </p>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/cuenta/recuperar" className="font-medium text-brand-accent hover:underline">
              Solicitar un nuevo enlace
            </Link>
          </p>
        </div>
      </LoginPageShell>
    );
  }

  return (
    <LoginPageShell>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-brand-forest">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-gray-600">
          Elige una contraseña segura para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <PasswordInput
              label="Nueva contraseña"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">{STRONG_PASSWORD_MESSAGE}</p>
          </div>
          <div>
            <PasswordInput
              label="Confirmar contraseña"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </LoginPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <LoginPageShell>
          <p className="text-gray-500">Cargando…</p>
        </LoginPageShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
