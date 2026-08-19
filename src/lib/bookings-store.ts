import { readJson, writeJson, generateId } from "@/lib/json-store";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  nextPrefixedId,
} from "@/lib/supabase/client";
import {
  bookingFromRow,
  bookingToRow,
  type BookingRow,
} from "@/lib/supabase/mappers";
import type { Booking, BookingStatus, TravelerDetails } from "@/lib/types";

const FILE = "bookings.json";

async function sbGetBookings(): Promise<Booking[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as BookingRow[]) ?? []).map(bookingFromRow);
}

export async function getBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured()) return sbGetBookings();
  return readJson(FILE, []);
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("bookings")
      .upsert(bookings.map(bookingToRow), { onConflict: "id" });
    if (error) throw error;
    return;
  }
  await writeJson(FILE, bookings);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? bookingFromRow(data as BookingRow) : undefined;
  }
  const bookings = await getBookings();
  return bookings.find((b) => b.id === id);
}

export async function createBooking(data: {
  offerId: string;
  campingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalAmount?: number;
  accommodationId?: string;
  accommodationName?: string;
  travelerDetails?: TravelerDetails;
}): Promise<Booking> {
  const totalAmount =
    data.totalAmount ?? data.nights * data.guests * data.pricePerNight;
  const booking: Booking = {
    id: isSupabaseConfigured()
      ? await nextPrefixedId("bookings", "book")
      : generateId("book", await readJson(FILE, [])),
    offerId: data.offerId,
    campingId: data.campingId,
    customerId: data.customerId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    nights: data.nights,
    pricePerNight: data.pricePerNight,
    totalAmount,
    accommodationId: data.accommodationId,
    accommodationName: data.accommodationName,
    travelerDetails: data.travelerDetails,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("bookings")
      .insert(bookingToRow(booking));
    if (error) throw error;
    return booking;
  }

  const bookings = await readJson<Booking[]>(FILE, []);
  bookings.push(booking);
  await writeJson(FILE, bookings);
  return booking;
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | undefined> {
  const current = await getBookingById(id);
  if (!current) return undefined;
  const updated: Booking = {
    ...current,
    status,
    paidAt: status === "paid" ? new Date().toISOString() : current.paidAt,
  };

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("bookings")
      .update(bookingToRow(updated))
      .eq("id", id);
    if (error) throw error;
    return updated;
  }

  const bookings = await readJson<Booking[]>(FILE, []);
  const index = bookings.findIndex((b) => b.id === id);
  if (index < 0) return undefined;
  bookings[index] = updated;
  await writeJson(FILE, bookings);
  return updated;
}

export function countPaidSales(bookings: Booking[]): number {
  return bookings.filter((b) => b.status === "paid").length;
}

export function sumPaidRevenue(bookings: Booking[]): number {
  return bookings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);
}
