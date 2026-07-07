import Link from "next/link";
import Logo from "@/components/Logo";
import type { SiteBranding } from "@/lib/branding";

const footerSections = [
  {
    title: "Explorar",
    links: [
      { href: "/", label: "Inicio" },
      { href: "/campings", label: "Campings de montaña" },
      { href: "/playa", label: "Campings de playa" },
      { href: "/perros", label: "Campings con perros" },
      { href: "/glamping", label: "Glampings" },
    ],
  },
  {
    title: "Tu cuenta",
    links: [
      { href: "/signup", label: "Crear cuenta" },
      { href: "/cuenta/login", label: "Iniciar sesión" },
    ],
  },
  {
    title: "Para campings",
    links: [
      { href: "/camping/login", label: "Espacio campings" },
      { href: "/camping/registro", label: "Publica tu camping" },
    ],
  },
];

type FooterProps = {
  branding?: SiteBranding;
};

export default function Footer({ branding }: FooterProps) {
  const footerText =
    branding?.footerText ??
    "Reserva campings, glampings y hoteles en España.";

  return (
    <footer className="mt-auto border-t border-gray-200 bg-brand-forest-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block max-w-full">
              <Logo variant="light" branding={branding} />
            </Link>
            <p className="mt-4 text-sm text-green-100">{footerText}</p>
            {branding?.contactPhone && (
              <p className="mt-2 text-sm text-green-100">{branding.contactPhone}</p>
            )}
            <ul className="mt-4 space-y-1 text-sm text-green-100">
              <li>Confirmación inmediata</li>
            </ul>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-200">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-green-50 transition hover:text-brand-sun"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
