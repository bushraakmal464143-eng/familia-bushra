import PortalShell from "@/components/portal/PortalShell";
import { SITE_NAME } from "@/lib/site";

export const metadata = {
  title: `Mi cuenta | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/cuenta", label: "Mis reservas", exact: true },
];

export default function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      title={SITE_NAME}
      titleAccent="Cliente"
      nav={nav}
      loginPath="/cuenta/login"
      logoutApi="/api/cuenta/logout"
      publicLink={{ href: "/", label: "Buscar ofertas →" }}
    >
      {children}
    </PortalShell>
  );
}
