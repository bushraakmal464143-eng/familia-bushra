import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCampings } from "@/lib/campings-store";
import { getOffers } from "@/lib/offers-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [campings, offers] = await Promise.all([getCampings(), getOffers()]);

  const pendingCampings = campings
    .filter((c) => c.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt,
      href: `/admin/campings/${c.id}`,
    }));

  const campingNameById = Object.fromEntries(
    campings.map((c) => [c.id, c.name])
  );

  const pendingOffers = offers
    .filter((o) => o.status === "pending")
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((o) => ({
      id: o.id,
      title: o.title,
      campingName: campingNameById[o.campingId] ?? o.campingId,
      href: `/admin/offers/${o.id}/edit`,
    }));

  return NextResponse.json({
    pendingCampings,
    pendingOffers,
    total: pendingCampings.length + pendingOffers.length,
  });
}
