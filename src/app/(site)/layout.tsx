import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toBranding } from "@/lib/branding";
import { getCurrentCustomer } from "@/lib/current-customer";
import { getSiteSettings } from "@/lib/site-settings-store";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, customer] = await Promise.all([
    getSiteSettings(),
    getCurrentCustomer(),
  ]);
  const branding = toBranding(settings);

  return (
    <>
      <Header branding={branding} customer={customer} />
      <main className="flex-1">{children}</main>
      <Footer branding={branding} />
    </>
  );
}
