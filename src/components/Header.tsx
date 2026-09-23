"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

function customerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function CustomerAvatar({
  customer,
  className,
}: {
  customer: CurrentCustomer;
  className: string;
}) {
  const initials = customerInitials(customer.name) || "?";
  if (customer.avatarUrl) {
    return (
      <span className={`relative block overflow-hidden rounded-full ${className}`}>
        <Image
          src={customer.avatarUrl}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
        />
      </span>
    );
  }
  return (
    <span
      className={`flex items-center justify-center rounded-full font-semibold text-white ${className}`}
    >
      {initials}
    </span>
  );
}

export default function Header({ branding, customer }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const loginHref = `/cuenta/login?from=${encodeURIComponent(pathname || "/")}`;
  const closeMenu = () => setIsMenuOpen(false);
  const isLoggedIn = Boolean(customer);

  useEffect(() => {
    setIsMenuOpen(false);
    setProfileOpen(false);
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

  useEffect(() => {
    if (!profileOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/cuenta/logout", {
        method: "POST",
        credentials: "include",
      });
      setProfileOpen(false);
      closeMenu();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header w-full">
      <div className="sticky top-0 z-50 border-b border-brand-sand/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="min-w-0 shrink transition hover:opacity-90"
            onClick={closeMenu}
          >
            <Logo branding={branding} />
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="mr-1 hidden items-center gap-1 border-r border-gray-200 pr-3 lg:flex">
              <Link
                href="/camping/login"
                className="rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-brand-cream hover:text-brand-forest"
              >
                Espacio campings
              </Link>
              <Link
                href="/camping/registro"
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-accent transition hover:bg-orange-50"
              >
                Registrar camping
              </Link>
            </div>

            {isLoggedIn && customer ? (
              <div className="relative hidden lg:block" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className={`group inline-flex items-center gap-2.5 rounded-full border bg-white py-1 pl-1 pr-2.5 text-left shadow-sm transition ${
                    profileOpen
                      ? "border-brand-forest/25 ring-2 ring-brand-forest/10"
                      : "border-gray-200/90 hover:border-brand-forest/20 hover:shadow"
                  }`}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="Abrir menú de perfil"
                >
                  <span className="relative">
                    <CustomerAvatar
                      customer={customer}
                      className="h-9 w-9 bg-brand-forest text-[13px] tracking-wide"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-green-light" />
                  </span>
                  <span className="min-w-0 pr-0.5">
                    <span className="block max-w-[8.5rem] truncate text-[13px] font-semibold text-gray-900">
                      {customerFirstName(customer.name)}
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      Ver perfil
                    </span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`mr-0.5 h-4 w-4 text-gray-400 transition duration-200 group-hover:text-gray-600 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2.5 w-[17.5rem] origin-top-right overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_12px_40px_-12px_rgba(20,83,45,0.25)]"
                  >
                    <div className="relative overflow-hidden px-4 py-4">
                      <div className="absolute inset-0 bg-brand-forest" />
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-green/40" />
                      <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-brand-accent/20" />
                      <div className="relative flex items-center gap-3">
                        <CustomerAvatar
                          customer={customer}
                          className="h-11 w-11 bg-white/15 text-sm font-bold ring-1 ring-white/25"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {customer.name}
                          </p>
                          <p className="truncate text-xs text-white/75">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/cuenta"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-brand-cream"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cream text-brand-forest">
                          <UserIcon />
                        </span>
                        <span>
                          <span className="block">Mi perfil</span>
                          <span className="block text-[11px] font-normal text-gray-500">
                            Reservas y calendario
                          </span>
                        </span>
                      </Link>
                      <div className="my-1.5 border-t border-gray-100" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <LogoutIcon />
                        </span>
                        {loggingOut ? "Saliendo…" : "Cerrar sesión"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/signup"
                  className="rounded-full px-4 py-2 text-sm font-medium text-brand-forest transition hover:bg-brand-cream"
                  onClick={closeMenu}
                >
                  Registrarse
                </Link>
                <Link
                  href={loginHref}
                  className="rounded-full bg-brand-forest px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-forest-dark"
                  onClick={closeMenu}
                >
                  Iniciar sesión
                </Link>
              </div>
            )}

            {isLoggedIn && customer && (
              <Link
                href="/cuenta"
                className="inline-flex lg:hidden"
                aria-label="Mi perfil"
                onClick={closeMenu}
              >
                <CustomerAvatar
                  customer={customer}
                  className="h-9 w-9 bg-brand-forest text-xs shadow-sm"
                />
              </Link>
            )}

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-brand-cream lg:hidden"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      <nav
        className="hidden border-b border-brand-sand/60 bg-brand-cream/40 lg:block"
        aria-label="Principal"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:justify-between lg:px-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-white text-brand-forest shadow-sm ring-1 ring-brand-sand"
                    : "text-gray-600 hover:bg-white/70 hover:text-brand-forest"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        id="mobile-menu"
        className={`${
          isMenuOpen ? "fixed inset-0 top-[3.75rem] z-40 flex" : "hidden"
        } h-[calc(100dvh-3.75rem)] w-full flex-col gap-1 overflow-y-auto border-t border-brand-sand bg-brand-cream/95 px-4 py-4 backdrop-blur-md lg:hidden`}
        aria-label="Móvil"
      >
        {isLoggedIn && customer && (
          <div className="mb-3 overflow-hidden rounded-2xl border border-brand-sand bg-white shadow-sm">
            <div className="bg-brand-forest px-4 py-4">
              <div className="flex items-center gap-3">
                <CustomerAvatar
                  customer={customer}
                  className="h-12 w-12 bg-white/15 text-base font-bold ring-1 ring-white/20"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {customer.name}
                  </p>
                  <p className="truncate text-xs text-white/70">
                    {customer.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-0.5 p-2">
              <Link
                href="/cuenta"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-brand-forest hover:bg-brand-cream"
                onClick={closeMenu}
              >
                Mi perfil y reservas
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {loggingOut ? "Saliendo…" : "Cerrar sesión"}
              </button>
            </div>
          </div>
        )}

        <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Explorar
        </p>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-3 py-3 text-[15px] transition ${
              isActive(link.href)
                ? "bg-white font-semibold text-brand-forest shadow-sm"
                : "text-gray-700 hover:bg-white/80 hover:text-brand-forest"
            }`}
            onClick={closeMenu}
          >
            {link.label}
          </Link>
        ))}

        <div className="my-3 border-t border-brand-sand" />

        <Link
          href="/camping/login"
          className="rounded-xl px-3 py-3 text-[15px] font-medium text-gray-700 hover:bg-white/80"
          onClick={closeMenu}
        >
          Espacio campings
        </Link>
        <Link
          href="/camping/registro"
          className="rounded-xl px-3 py-3 text-[15px] font-medium text-brand-accent hover:bg-orange-50"
          onClick={closeMenu}
        >
          Registrar camping
        </Link>

        {!isLoggedIn && (
          <div className="mt-4 grid gap-2">
            <Link
              href={loginHref}
              className="rounded-full bg-brand-forest px-4 py-3 text-center text-[15px] font-semibold text-white"
              onClick={closeMenu}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-brand-forest/20 bg-white px-4 py-3 text-center text-[15px] font-medium text-brand-forest"
              onClick={closeMenu}
            >
              Registrarse
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943H18.25A.75.75 0 0019 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}
