import type { OfferCategory } from "@/lib/offers";

export type OfferStatus = "active" | "draft" | "inactive";
export type OfferSetting = "mountain" | "beach";
export type CampingStatus = "pending" | "active" | "suspended";
export type BookingStatus = "pending" | "paid" | "cancelled";

export type TravelerDetails = {
  firstName: string;
  lastName: string;
  country: string;
  documentId: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  requestInvoice: boolean;
  roomRequests?: string;
};

export type Camping = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  location: string;
  region: string;
  description: string;
  photos: string[];
  status: CampingStatus;
  createdAt: string;
};

export type SiteSettings = {
  siteName: string;
  siteTagline: string;
  logoPart1: string;
  logoAccent: string;
  logoPart2: string;
  logoSuffix: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  offersHeading: string;
  trustPoint: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: string;
};

/** Bungalow / chalet unit configured per offer in admin */
export type OfferAccommodationUnit = {
  id: string;
  name: string;
  image: string;
  infoText: string;
  pricePerPerson: number;
  maxGuests: number;
  roomsLeft?: number;
  refundable: boolean;
  enabled: boolean;
};

export type OfferRecord = {
  id: string;
  campingId: string;
  title: string;
  subtitle: string;
  location: string;
  region: string;
  mealPlan?: string;
  highlights: string[];
  description: string;
  travelDates: string;
  priceFrom: number;
  image: string;
  gallery?: string[];
  badge?: string;
  countdown?: string;
  countdownProgress?: number; // 0..100
  nightsOptions?: number[]; // e.g. [1,2,3,4,5]
  ctaText?: string; // supports {price}
  accommodationName?: string; // overrides camping/subtitle in boxes
  accommodationLinkText?: string; // e.g. "Ver alojamiento →"
  accommodations?: OfferAccommodationUnit[];
  mapLabel?: string;
  mapLat?: number;
  mapLng?: number;
  category: Exclude<OfferCategory, "all">;
  setting?: OfferSetting;
  petFriendly?: boolean;
  isGlamping?: boolean;
  isHotel?: boolean;
  status: OfferStatus;
  featured?: boolean;
};

export type Booking = {
  id: string;
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
  totalAmount: number;
  accommodationId?: string;
  accommodationName?: string;
  travelerDetails?: TravelerDetails;
  status: BookingStatus;
  createdAt: string;
  paidAt?: string;
};

export type ContactInquiry = {
  id: string;
  name: string;
  campsiteName: string;
  email: string;
  phone: string;
  comments: string;
  createdAt: string;
};
