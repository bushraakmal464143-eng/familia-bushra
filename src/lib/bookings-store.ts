import { readJson, writeJson, generateId } from "@/lib/json-store";
import type { Booking, BookingStatus, TravelerDetails } from "@/lib/types";

const FILE = "bookings.json";

export async function getBookings(): Promise<Booking[]> {
  return readJson(FILE, []);
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  await writeJson(FILE, bookings);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
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
  const bookings = await getBookings();
  const totalAmount =
    data.totalAmount ?? data.nights * data.guests * data.pricePerNight;
  const booking: Booking = {
    id: generateId("book", bookings),
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
  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | undefined> {
  const bookings = await getBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index < 0) return undefined;
  bookings[index] = {
    ...bookings[index],
    status,
    paidAt: status === "paid" ? new Date().toISOString() : bookings[index].paidAt,
  };
  await saveBookings(bookings);
  return bookings[index];
}

export function countPaidSales(bookings: Booking[]): number {
  return bookings.filter((b) => b.status === "paid").length;
}

export function sumPaidRevenue(bookings: Booking[]): number {
  return bookings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);
}
