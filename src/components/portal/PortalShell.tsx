"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string; exact?: boolean };

type PortalShellProps = {
  children: React.ReactNode;
  title: string;
  titleAccent?: string;
  nav: NavLink[];
  loginPath: string;
  logoutApi: string;
  publicLink?: { href: string; label: string };
};

function linkClass(active: boolean) {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    active
      ? "bg-brand-forest text-white"
      : "text-gray-600 hover:bg-gray-100"
  }`;
}

export default function PortalShell({
  children,
  title,
  titleAccent,
  nav,
  loginPath,
  logoutApi,
  publicLink,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthPage = pathname === loginPath || pathname.endsWith("/registro");

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen || isAuthPage) return;

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
  }, [isMenuOpen, isAuthPage]);

  async function logout() {
    closeMenu();
    await fetch(logoutApi, { method: "POST" });
    router.push(loginPath);
    router.refresh();
  }

  function isActive(link: NavLink) {
    return link.exact
      ? pathname === link.href
      : pathname.startsWith(link.href);
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href={nav[0]?.href ?? "/"}
            className="min-w-0 shrink font-bold text-brand-forest"
            onClick={closeMenu}
          >
            <span className="block truncate text-sm sm:text-base">
              <span className="sm:hidden">
                {titleAccent ?? title}
              </span>
              <span className="hidden sm:inline">
                {title}
                {titleAccent && (
                  <span className="text-brand-accent"> {titleAccent}</span>
                )}
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Portal"
          >
            {nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(isActive(link))}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {publicLink && (
              <Link
                href={publicLink.href}
                target="_blank"
                className="text-sm text-gray-500 hover:text-brand-accent"
              >
                {publicLink.label}
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Salir
            </button>
          </div>

          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 md:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="portal-mobile-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav
          id="portal-mobile-menu"
          className={`${isMenuOpen ? "flex" : "hidden"} flex-col gap-1 border-t border-gray-100 px-4 py-3 md:hidden`}
          aria-label="Portal móvil"
        >
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(isActive(link))}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
            {publicLink && (
              <Link
                href={publicLink.href}
                target="_blank"
                className="rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={closeMenu}
              >
                {publicLink.label}
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Salir
            </button>
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
