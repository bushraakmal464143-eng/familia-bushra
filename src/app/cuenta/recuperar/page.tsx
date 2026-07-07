"use client";

import Link from "next/link";
import { useState } from "react";
import LoginPageShell from "@/components/LoginPageShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/cuenta/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el correo.");
        return;
      }

      setMessage(
        data.message ??
          "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña."
      );
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
        <h1 className="text-xl font-bold text-brand-forest">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-gray-600">
          Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link href="/cuenta/login" className="font-medium text-brand-accent hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </LoginPageShell>
  );
}
