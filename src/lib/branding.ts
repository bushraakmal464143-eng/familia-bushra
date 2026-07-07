import type { SiteSettings } from "@/lib/types";

export type SiteBranding = Pick<
  SiteSettings,
  | "siteName"
  | "logoPart1"
  | "logoAccent"
  | "logoPart2"
  | "logoSuffix"
  | "footerText"
  | "contactEmail"
  | "contactPhone"
>;

export function toBranding(settings: SiteSettings): SiteBranding {
  return {
    siteName: settings.siteName,
    logoPart1: settings.logoPart1,
    logoAccent: settings.logoAccent,
    logoPart2: settings.logoPart2,
    logoSuffix: settings.logoSuffix,
    footerText: settings.footerText,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
  };
}
