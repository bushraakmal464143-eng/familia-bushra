"use client";

import { useEffect, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

export default function CampingContactCTA() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [campsiteName, setCampsiteName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function resetForm() {
    setName("");
    setCampsiteName("");
    setEmail("");
    setPhone("");
    setComments("");
    setError(null);
    setSuccess(false);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, campsiteName, email, phone, comments }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo enviar el formulario.");
      return;
    }

    setSuccess(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-brand-accent px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
      >
        Más información
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-form-title"
            className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar"
            >
              ✕
            </button>

            {success ? (
              <div className="py-4 text-center">
                <h2
                  id="contact-form-title"
                  className="text-xl font-bold text-brand-forest"
                >
                  ¡Mensaje enviado!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Gracias por tu interés. Nos pondremos en contacto contigo pronto.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-6 rounded-lg bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <h2
                  id="contact-form-title"
                  className="text-xl font-bold text-brand-forest"
                >
                  Solicitar información
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Cuéntanos sobre tu camping o glamping y te responderemos lo antes posible.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      className={inputClass}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Nombre del camping
                    </label>
                    <input
                      className={inputClass}
                      value={campsiteName}
                      onChange={(e) => setCampsiteName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Teléfono de contacto
                    </label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Comentarios
                    </label>
                    <textarea
                      className={`${inputClass} min-h-[100px] resize-y`}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Cuéntanos más sobre tu establecimiento..."
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                      {loading ? "Enviando…" : "Enviar"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
