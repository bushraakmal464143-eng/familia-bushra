"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import type { SiteBranding } from "@/lib/branding";
import type { CurrentCustomer } from "@/lib/current-customer";
import { customerFirstName } from "@/lib/customer-display";

const navLinks = [
  { href: "/campings", label: "Campings de montaña" },
  { href: "/playa", label: "Campings de playa" },
  { href: "/perros", label: "Campings con perros" },
  { href: "/glamping", label: "Glampings" },
  { href: "/hoteles-playa", label: "Hoteles de playa" },
  { href: "/hoteles-montana", label: "Hoteles de montaña" },
  { href: "/hoteles-perros", label: "Hoteles que admiten perros" },
];

type HeaderProps = {
  branding?: SiteBranding;
  customer?: CurrentCustomer | null;
};

export default function Header({ branding, customer }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loginHref = `/cuenta/login?from=${encodeURIComponent(pathname || "/")}`;

  const closeMenu = () => setIsMenuOpen(false);
  const isLoggedIn = Boolean(customer);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/cuenta/logout", { method: "POST", credentials: "include" });
      closeMenu();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      {isLoggedIn && customer && (
        <div className="hidden w-full border-b border-brand-accent/20 bg-orange-50 sm:block">
          <div className="mx-auto max-w-7xl px-4 py-2 text-sm text-gray-800 sm:px-6 lg:px-8">
            Bienvenido,{" "}
            <span className="font-semibold text-brand-accent">
              {customerFirstName(customer.name)}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="min-w-0 shrink transition opacity-90 hover:opacity-100"
          onClick={closeMenu}
        >
          <Logo branding={branding} />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/camping/login"
            className="hidden text-sm font-medium text-gray-600 hover:text-brand-accent lg:inline"
          >
            Espacio campings
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/cuenta"
                className="hidden rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 lg:inline"
                onClick={closeMenu}
              >
                Mis reservas
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 lg:inline"
              >
                {loggingOut ? "Saliendo…" : "Salir"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden rounded-md border border-brand-accent px-3 py-1.5 text-sm font-medium text-brand-accent transition hover:bg-orange-50 lg:inline"
                onClick={closeMenu}
              >
                Registrarse
              </Link>
              <Link
                href={loginHref}
                className="hidden rounded-md border border-brand-green bg-brand-green px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-forest lg:inline"
                onClick={closeMenu}
              >
                Iniciar sesión
              </Link>
            </>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 lg:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <nav
        className="hidden w-full border-t border-gray-100 bg-white lg:block"
        aria-label="Principal"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-1.5 px-4 py-2.5 sm:px-6 lg:px-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 transition hover:text-brand-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <nav
        id="mobile-menu"
        className={`${
          isMenuOpen ? "fixed inset-0 top-[4.25rem] z-40 flex" : "hidden"
        } h-[calc(100dvh-4.25rem)] w-full flex-col gap-1 overflow-y-auto border-t border-gray-100 bg-white px-4 py-4 lg:hidden`}
        aria-label="Móvil"
      >
        {isLoggedIn && customer && (
          <p className="rounded-md bg-orange-50 px-3 py-2 text-sm text-gray-800">
            Bienvenido,{" "}
            <span className="font-semibold text-brand-accent">
              {customerFirstName(customer.name)}
            </span>
          </p>
        )}
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-3 text-base text-gray-700 transition hover:bg-gray-50 hover:text-brand-accent"
            onClick={closeMenu}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/camping/login"
          className="rounded-md px-3 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-brand-accent"
          onClick={closeMenu}
        >
          Espacio campings
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              href="/cuenta"
              className="rounded-md px-3 py-3 text-base font-medium text-brand-forest transition hover:bg-gray-50"
              onClick={closeMenu}
            >
              Mis reservas
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-md px-3 py-3 text-left text-base font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {loggingOut ? "Saliendo…" : "Salir"}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md px-3 py-3 text-base font-medium text-brand-accent transition hover:bg-orange-50"
              onClick={closeMenu}
            >
              Registrarse
            </Link>
            <Link
              href={loginHref}
              className="rounded-md bg-brand-green px-3 py-3 text-base font-medium text-white transition hover:bg-brand-forest"
              onClick={closeMenu}
            >
              Iniciar sesión
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
