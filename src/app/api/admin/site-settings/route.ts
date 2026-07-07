import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getSiteSettings,
  saveSiteSettings,
} from "@/lib/site-settings-store";
import type { SiteSettings } from "@/lib/types";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as Partial<SiteSettings>;
  const allowed: (keyof SiteSettings)[] = [
    "siteName",
    "siteTagline",
    "logoPart1",
    "logoAccent",
    "logoPart2",
    "logoSuffix",
    "heroTitle",
    "heroSubtitle",
    "heroImageUrl",
    "offersHeading",
    "trustPoint",
    "footerText",
    "contactEmail",
    "contactPhone",
  ];

  const patch: Partial<SiteSettings> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      patch[key] = String(body[key]).trim() as never;
    }
  }

  const settings = await saveSiteSettings(patch);
  return NextResponse.json(settings);
}
