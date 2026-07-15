import { readJson, writeJson } from "@/lib/json-store";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

const FILE = "site-settings.json";

const HERO_IMAGE = "/offers/homepage-hero.png";

export function defaultSiteSettings(): SiteSettings {
  return {
    siteName: SITE_NAME,
    siteTagline: SITE_TAGLINE,
    logoPart1: "Ofertas",
    logoAccent: "de",
    logoPart2: "CampingyHoteles",
    logoSuffix: ".com",
    heroTitle: "Las mejores ofertas de campings y hoteles por tiempo limitado",
    heroSubtitle: `Encuentra tu alojamiento perfecto en España con ${SITE_NAME}.`,
    heroImageUrl: HERO_IMAGE,
    offersHeading: "Ofertas de campings y hoteles",
    trustPoint: "Confirmación al instante",
    footerText: "Reserva campings, glampings y hoteles en España.",
    contactEmail: "info@ofertasdecamping.com",
    contactPhone: "",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSiteName(name: string): string {
  const lower = name.trim().toLowerCase();
  if (
    lower === "ofertasdecamping.com" ||
    lower === "ofertasdecampingyhoteles.com" ||
    lower === "campolibre" ||
    lower === "ofertas de camping.com"
  ) {
    return SITE_NAME;
  }
  return name;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await readJson<Partial<SiteSettings> | null>(FILE, null);
  if (!raw) return defaultSiteSettings();
  const merged = { ...defaultSiteSettings(), ...raw };
  if (merged.siteName) {
    merged.siteName = normalizeSiteName(merged.siteName);
  }
  return merged;
}

export async function saveSiteSettings(
  patch: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(FILE, next);
  return next;
}
