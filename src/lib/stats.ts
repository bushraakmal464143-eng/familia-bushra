import { getBookings, countPaidSales, sumPaidRevenue } from "@/lib/bookings-store";
import { getCampings } from "@/lib/campings-store";
import { getOffers } from "@/lib/offers-store";
import type { Booking, Camping } from "@/lib/types";

export type CampingWithStats = Camping & {
  offerCount: number;
  activeOffers: number;
  paidSales: number;
  revenue: number;
  pendingBookings: number;
};

export async function getAdminStats() {
  const [campings, offers, bookings] = await Promise.all([
    getCampings(),
    getOffers(),
    getBookings(),
  ]);

  const activeOffers = offers.filter((o) => o.status === "active");
  const paidBookings = bookings.filter((b) => b.status === "paid");

  const campingsWithStats: CampingWithStats[] = campings.map((c) => {
    const campingOffers = offers.filter((o) => o.campingId === c.id);
    const campingBookings = bookings.filter((b) => b.campingId === c.id);
    const paid = campingBookings.filter((b) => b.status === "paid");
    return {
      ...c,
      offerCount: campingOffers.length,
      activeOffers: campingOffers.filter((o) => o.status === "active").length,
      paidSales: paid.length,
      revenue: sumPaidRevenue(campingBookings),
      pendingBookings: campingBookings.filter((b) => b.status === "pending")
        .length,
    };
  });

  const byStatus = {
    pending: campings.filter((c) => c.status === "pending").length,
    active: campings.filter((c) => c.status === "active").length,
    suspended: campings.filter((c) => c.status === "suspended").length,
  };

  const registrationsByMonth = groupRegistrationsByMonth(campings);

  return {
    totalCampings: campings.length,
    campingsByStatus: byStatus,
    activeOffersCount: activeOffers.length,
    totalOffers: offers.length,
    totalBookings: bookings.length,
    paidBookings: paidBookings.length,
    totalRevenue: sumPaidRevenue(bookings),
    campingsWithStats,
    registrationsByMonth,
  };
}

function groupRegistrationsByMonth(campings: Camping[]) {
  const map = new Map<string, number>();
  for (const c of campings) {
    const month = c.createdAt.slice(0, 7);
    map.set(month, (map.get(month) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export async function getCampingStats(campingId: string) {
  const [offers, bookings] = await Promise.all([
    getOffers(),
    getBookings(),
  ]);
  const mine = offers.filter((o) => o.campingId === campingId);
  const myBookings = bookings.filter((b) => b.campingId === campingId);
  return {
    offers: mine.length,
    activeOffers: mine.filter((o) => o.status === "active").length,
    paidSales: countPaidSales(myBookings),
    revenue: sumPaidRevenue(myBookings),
    pendingPayments: myBookings.filter((b) => b.status === "pending").length,
    recentBookings: myBookings
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10),
  };
}

export function formatBookingStatus(status: Booking["status"]) {
  const labels = {
    pending: "Pendiente de pago",
    paid: "Pagada",
    cancelled: "Cancelada",
  };
  return labels[status];
}
