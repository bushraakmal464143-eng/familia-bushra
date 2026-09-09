import type { PartnerContactInquiry } from "@/lib/partner-contacts-store";
import type {
  Booking,
  Camping,
  ContactInquiry,
  Customer,
  OfferRecord,
  SiteSettings,
  TravelerDetails,
} from "@/lib/types";

export type CustomerRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  google_id: string | null;
  reset_token_hash: string | null;
  reset_token_expires_at: string | null;
  created_at: string;
  last_login_at: string | null;
};

export type CampingRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  location: string;
  region: string;
  description: string;
  photos: string[];
  profile_complete: boolean;
  status: Camping["status"];
  created_at: string;
};

export type OfferRow = {
  id: string;
  camping_id: string;
  title: string;
  subtitle: string;
  location: string;
  region: string;
  meal_plan: string | null;
  highlights: string[];
  description: string;
  travel_dates: string;
  price_from: number;
  image: string;
  gallery: string[] | null;
  badge: string | null;
  countdown: string | null;
  countdown_progress: number | null;
  nights_options: number[] | null;
  cta_text: string | null;
  accommodation_name: string | null;
  accommodation_link_text: string | null;
  accommodations: OfferRecord["accommodations"] | null;
  map_label: string | null;
  map_lat: number | null;
  map_lng: number | null;
  category: string;
  display_pages: string[] | null;
  setting: OfferRecord["setting"] | null;
  pet_friendly: boolean | null;
  is_glamping: boolean | null;
  is_hotel: boolean | null;
  status: OfferRecord["status"];
  featured: boolean;
};

export type BookingRow = {
  id: string;
  offer_id: string;
  camping_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  price_per_night: number;
  total_amount: number;
  accommodation_id: string | null;
  accommodation_name: string | null;
  traveler_details: TravelerDetails | null;
  status: Booking["status"];
  created_at: string;
  paid_at: string | null;
};

export type SiteSettingsRow = {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_part1: string;
  logo_accent: string;
  logo_part2: string;
  logo_suffix: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  offers_heading: string;
  trust_point: string;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  updated_at: string;
};

export function customerFromRow(row: CustomerRow): Customer & {
  resetTokenHash?: string;
  resetTokenExpiresAt?: string;
} {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash ?? undefined,
    googleId: row.google_id ?? undefined,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at ?? undefined,
    resetTokenHash: row.reset_token_hash ?? undefined,
    resetTokenExpiresAt: row.reset_token_expires_at ?? undefined,
  };
}

export function customerToRow(
  customer: Customer & {
    resetTokenHash?: string;
    resetTokenExpiresAt?: string;
  }
): CustomerRow {
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    password_hash: customer.passwordHash ?? null,
    google_id: customer.googleId ?? null,
    reset_token_hash: customer.resetTokenHash ?? null,
    reset_token_expires_at: customer.resetTokenExpiresAt ?? null,
    created_at: customer.createdAt,
    last_login_at: customer.lastLoginAt ?? null,
  };
}

export function campingFromRow(row: CampingRow): Camping {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone ?? undefined,
    location: row.location,
    region: row.region,
    description: row.description,
    photos: row.photos ?? [],
    profileComplete: row.profile_complete,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function campingToRow(camping: Camping): CampingRow {
  return {
    id: camping.id,
    name: camping.name,
    email: camping.email,
    password_hash: camping.passwordHash,
    phone: camping.phone ?? null,
    location: camping.location,
    region: camping.region,
    description: camping.description,
    photos: camping.photos,
    profile_complete: camping.profileComplete,
    status: camping.status,
    created_at: camping.createdAt,
  };
}

export function offerFromRow(row: OfferRow): OfferRecord {
  return {
    id: row.id,
    campingId: row.camping_id,
    title: row.title,
    subtitle: row.subtitle,
    location: row.location,
    region: row.region,
    mealPlan: row.meal_plan ?? undefined,
    highlights: row.highlights ?? [],
    description: row.description,
    travelDates: row.travel_dates,
    priceFrom: Number(row.price_from),
    image: row.image,
    gallery: row.gallery ?? undefined,
    badge: row.badge ?? undefined,
    countdown: row.countdown ?? undefined,
    countdownProgress: row.countdown_progress ?? undefined,
    nightsOptions: row.nights_options ?? undefined,
    ctaText: row.cta_text ?? undefined,
    accommodationName: row.accommodation_name ?? undefined,
    accommodationLinkText: row.accommodation_link_text ?? undefined,
    accommodations: row.accommodations ?? undefined,
    mapLabel: row.map_label ?? undefined,
    mapLat: row.map_lat ?? undefined,
    mapLng: row.map_lng ?? undefined,
    category: row.category as OfferRecord["category"],
    displayPages: (row.display_pages ?? undefined) as OfferRecord["displayPages"],
    setting: row.setting ?? undefined,
    petFriendly: row.pet_friendly ?? undefined,
    isGlamping: row.is_glamping ?? undefined,
    isHotel: row.is_hotel ?? undefined,
    status: row.status,
    featured: row.featured,
  };
}

export function offerToRow(offer: OfferRecord): OfferRow {
  return {
    id: offer.id,
    camping_id: offer.campingId,
    title: offer.title,
    subtitle: offer.subtitle,
    location: offer.location,
    region: offer.region,
    meal_plan: offer.mealPlan ?? null,
    highlights: offer.highlights,
    description: offer.description,
    travel_dates: offer.travelDates,
    price_from: offer.priceFrom,
    image: offer.image,
    gallery: offer.gallery ?? null,
    badge: offer.badge ?? null,
    countdown: offer.countdown ?? null,
    countdown_progress: offer.countdownProgress ?? null,
    nights_options: offer.nightsOptions ?? null,
    cta_text: offer.ctaText ?? null,
    accommodation_name: offer.accommodationName ?? null,
    accommodation_link_text: offer.accommodationLinkText ?? null,
    accommodations: offer.accommodations ?? null,
    map_label: offer.mapLabel ?? null,
    map_lat: offer.mapLat ?? null,
    map_lng: offer.mapLng ?? null,
    category: offer.category,
    display_pages: offer.displayPages ?? null,
    setting: offer.setting ?? null,
    pet_friendly: offer.petFriendly ?? null,
    is_glamping: offer.isGlamping ?? null,
    is_hotel: offer.isHotel ?? null,
    status: offer.status,
    featured: Boolean(offer.featured),
  };
}

export function bookingFromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    offerId: row.offer_id,
    campingId: row.camping_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    nights: row.nights,
    pricePerNight: Number(row.price_per_night),
    totalAmount: Number(row.total_amount),
    accommodationId: row.accommodation_id ?? undefined,
    accommodationName: row.accommodation_name ?? undefined,
    travelerDetails: row.traveler_details ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined,
  };
}

export function bookingToRow(booking: Booking): BookingRow {
  return {
    id: booking.id,
    offer_id: booking.offerId,
    camping_id: booking.campingId,
    customer_id: booking.customerId,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    guests: booking.guests,
    nights: booking.nights,
    price_per_night: booking.pricePerNight,
    total_amount: booking.totalAmount,
    accommodation_id: booking.accommodationId ?? null,
    accommodation_name: booking.accommodationName ?? null,
    traveler_details: booking.travelerDetails ?? null,
    status: booking.status,
    created_at: booking.createdAt,
    paid_at: booking.paidAt ?? null,
  };
}

export function siteSettingsFromRow(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: row.site_name,
    siteTagline: row.site_tagline,
    logoPart1: row.logo_part1,
    logoAccent: row.logo_accent,
    logoPart2: row.logo_part2,
    logoSuffix: row.logo_suffix,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroImageUrl: row.hero_image_url,
    offersHeading: row.offers_heading,
    trustPoint: row.trust_point,
    footerText: row.footer_text,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    updatedAt: row.updated_at,
  };
}

export function siteSettingsToRow(settings: SiteSettings): SiteSettingsRow {
  return {
    id: "default",
    site_name: settings.siteName,
    site_tagline: settings.siteTagline,
    logo_part1: settings.logoPart1,
    logo_accent: settings.logoAccent,
    logo_part2: settings.logoPart2,
    logo_suffix: settings.logoSuffix,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    hero_image_url: settings.heroImageUrl,
    offers_heading: settings.offersHeading,
    trust_point: settings.trustPoint,
    footer_text: settings.footerText,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    updated_at: settings.updatedAt,
  };
}

export function contactInquiryFromRow(row: {
  id: string;
  name: string;
  campsite_name: string;
  email: string;
  phone: string;
  comments: string;
  created_at: string;
}): ContactInquiry {
  return {
    id: row.id,
    name: row.name,
    campsiteName: row.campsite_name,
    email: row.email,
    phone: row.phone,
    comments: row.comments,
    createdAt: row.created_at,
  };
}

export function partnerContactFromRow(row: {
  id: string;
  name: string;
  camping_name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
}): PartnerContactInquiry {
  return {
    id: row.id,
    name: row.name,
    campingName: row.camping_name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  };
}
