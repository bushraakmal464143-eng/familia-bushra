import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import type { OfferRecord } from "@/lib/types";

export type OfferMonthTab = {
  month: Date;
  label: string;
  fromPrice: number;
};

function hashSeed(offerId: string, isoDate: string): number {
  const raw = `${offerId}:${isoDate}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic per-date price for demo / until admin pricing exists. */
export function getOfferDatePrice(offer: OfferRecord, date: Date): number | null {
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  if (isBefore(day, today)) return null;

  const iso = format(day, "yyyy-MM-dd");
  const seed = hashSeed(offer.id, iso);
  if (seed % 11 === 0) return null;

  const base = offer.priceFrom;
  const weekendBoost = day.getDay() === 0 || day.getDay() === 6 ? 12 : 0;
  const variation = (seed % 47) - 8;
  return Math.max(base, base + variation + weekendBoost);
}

export function getOfferMonthTabs(offer: OfferRecord, count = 4): OfferMonthTab[] {
  const tabs: OfferMonthTab[] = [];
  let cursor = startOfMonth(new Date());

  for (let i = 0; i < count; i++) {
    const month = cursor;
    let minPrice = Number.POSITIVE_INFINITY;

    for (let d = 1; d <= endOfMonth(month).getDate(); d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      const price = getOfferDatePrice(offer, date);
      if (price != null) minPrice = Math.min(minPrice, price);
    }

    tabs.push({
      month,
      label: format(month, "LLLL", { locale: es }),
      fromPrice: Number.isFinite(minPrice) ? minPrice : offer.priceFrom,
    });

    cursor = startOfMonth(addMonths(cursor, 1));
  }

  return tabs;
}

export function getAvailableDatesInMonth(
  offer: OfferRecord,
  month: Date
): { date: Date; price: number }[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const results: { date: Date; price: number }[] = [];

  for (let d = start; !isBefore(end, d); d = addDays(d, 1)) {
    const price = getOfferDatePrice(offer, d);
    if (price != null) results.push({ date: d, price });
  }

  return results;
}

/** Each billed night from check-in (inclusive) to check-out (exclusive). */
export function getStayNights(checkIn: Date, checkOut: Date): Date[] {
  const start = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  if (!isBefore(start, end)) return [];

  const nights: Date[] = [];
  for (let d = start; isBefore(d, end); d = addDays(d, 1)) {
    nights.push(d);
  }
  return nights;
}

export type StayPricing = {
  nights: number;
  nightlyPrices: number[];
  pricePerNight: number;
  allAvailable: boolean;
};

export function calculateStayPricing(
  offer: OfferRecord,
  checkIn: Date,
  checkOut: Date
): StayPricing {
  const stayDates = getStayNights(checkIn, checkOut);
  const nightlyPrices = stayDates.map((d) => getOfferDatePrice(offer, d));
  const allAvailable = nightlyPrices.every((p) => p != null);
  const validPrices = nightlyPrices.filter((p): p is number => p != null);
  const sum = validPrices.reduce((acc, p) => acc + p, 0);
  const nights = stayDates.length;

  return {
    nights,
    nightlyPrices: validPrices,
    pricePerNight: nights > 0 ? Math.round(sum / nights) : offer.priceFrom,
    allAvailable,
  };
}
