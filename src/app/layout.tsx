import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings-store";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.siteName} | Campings, Glamping y Hoteles en España`,
    description: settings.siteTagline,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
