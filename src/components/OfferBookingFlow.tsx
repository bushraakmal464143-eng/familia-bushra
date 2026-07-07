"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import AccommodationPicker, {
  type AccommodationBookingDraft,
} from "@/components/AccommodationPicker";
import BookingCheckoutForm, {
  type CustomerProfile,
} from "@/components/BookingCheckoutForm";
import OfferBookingPanel from "@/components/OfferBookingPanel";
import {
  calculateAccommodationTotal,
  getAccommodationsForOffer,
} from "@/lib/offer-accommodations";
import type { OfferRecord, TravelerDetails } from "@/lib/types";

type BookingStep = "dates" | "accommodation" | "checkout";

type OfferBookingContextValue = {
  step: BookingStep;
  draft: AccommodationBookingDraft | null;
  selectedAccommodationId: string | null;
  setSelectedAccommodationId: (id: string) => void;
  loading: boolean;
  error: string | null;
  accommodations: ReturnType<typeof getAccommodationsForOffer>;
  goBackToDates: () => void;
  goBackToAccommodation: () => void;
  proceedToCheckout: () => void;
  confirmBooking: (travelerDetails: TravelerDetails) => Promise<void>;
  onDatesConfirmed: (draft: AccommodationBookingDraft) => void;
};

const OfferBookingContext = createContext<OfferBookingContextValue | null>(null);

function useOfferBooking() {
  const ctx = useContext(OfferBookingContext);
  if (!ctx) throw new Error("OfferBookingProvider required");
  return ctx;
}

type OfferBookingProviderProps = {
  offer: OfferRecord;
  customer: CustomerProfile | null;
  ctaText: string;
  countdown?: string;
  countdownProgress: number;
  galleryImages: string[];
  children: ReactNode;
};

function scrollToBookingFlow() {
  window.setTimeout(() => {
    document
      .getElementById("booking-flow")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

export function OfferBookingProvider({
  offer,
  customer,
  ctaText,
  countdown,
  countdownProgress,
  galleryImages,
  children,
}: OfferBookingProviderProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>("dates");
  const [draft, setDraft] = useState<AccommodationBookingDraft | null>(null);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accommodations = useMemo(() => {
    if (!draft) return [];
    return getAccommodationsForOffer(offer, draft.guests, galleryImages);
  }, [draft, offer, galleryImages]);

  function onDatesConfirmed(nextDraft: AccommodationBookingDraft) {
    setDraft(nextDraft);
    setSelectedAccommodationId(null);
    setError(null);
    setStep("accommodation");
    scrollToBookingFlow();
  }

  function goBackToDates() {
    setStep("dates");
    setError(null);
  }

  function goBackToAccommodation() {
    setStep("accommodation");
    setError(null);
  }

  function proceedToCheckout() {
    if (!draft || !selectedAccommodationId) {
      setError("Selecciona un alojamiento para continuar.");
      return;
    }

    const accommodation = accommodations.find(
      (a) => a.id === selectedAccommodationId
    );
    if (!accommodation?.available) {
      setError("El alojamiento seleccionado no está disponible.");
      return;
    }

    setError(null);
    setStep("checkout");
    scrollToBookingFlow();
  }

  async function confirmBooking(travelerDetails: TravelerDetails) {
    if (!draft || !selectedAccommodationId) {
      setError("Selecciona un alojamiento para continuar.");
      return;
    }

    const accommodation = accommodations.find(
      (a) => a.id === selectedAccommodationId
    );
    if (!accommodation?.available) {
      setError("El alojamiento seleccionado no está disponible.");
      return;
    }

    if (!customer) {
      router.push(`/cuenta/login?from=/ofertas/${offer.id}`);
      return;
    }

    const totalAmount = calculateAccommodationTotal(
      accommodation,
      draft.guests,
      draft.nights
    );

    setError(null);
    setLoading(true);
    const res = await fetch("/api/cuenta/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId: offer.id,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        guests: draft.guests,
        adults: draft.adults,
        children: draft.children,
        childAges: draft.children > 0 ? draft.childAges : undefined,
        pricePerNight: accommodation.pricePerPerson,
        totalAmount,
        accommodationId: accommodation.id,
        accommodationName: accommodation.name,
        travelerDetails,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear la reserva");
      return;
    }

    const booking = (await res.json()) as { id: string };
    router.push(`/pago?booking=${booking.id}`);
  }

  const value: OfferBookingContextValue = {
    step,
    draft,
    selectedAccommodationId,
    setSelectedAccommodationId,
    loading,
    error,
    accommodations,
    goBackToDates,
    goBackToAccommodation,
    proceedToCheckout,
    confirmBooking,
    onDatesConfirmed,
  };

  return (
    <OfferBookingContext.Provider value={value}>
      {children}
    </OfferBookingContext.Provider>
  );
}

export function OfferBookingSidebar({
  offer,
  customer,
  ctaText,
  countdown,
  countdownProgress,
}: {
  offer: OfferRecord;
  customer: CustomerProfile | null;
  ctaText: string;
  countdown?: string;
  countdownProgress: number;
}) {
  const { step, onDatesConfirmed } = useOfferBooking();

  if (step !== "dates") return null;

  return (
    <OfferBookingPanel
      offer={offer}
      customerId={customer?.id ?? null}
      ctaText={ctaText}
      countdown={countdown}
      countdownProgress={countdownProgress}
      onDatesConfirmed={onDatesConfirmed}
    />
  );
}

export function OfferBookingAccommodationSection({ offer }: { offer: OfferRecord }) {
  const {
    step,
    draft,
    accommodations,
    selectedAccommodationId,
    setSelectedAccommodationId,
    goBackToDates,
    proceedToCheckout,
    loading,
    error,
  } = useOfferBooking();

  if (step !== "accommodation" || !draft) return null;

  return (
    <AccommodationPicker
      offer={offer}
      draft={draft}
      options={accommodations}
      selectedId={selectedAccommodationId}
      onSelect={setSelectedAccommodationId}
      onBack={goBackToDates}
      onContinue={proceedToCheckout}
      loading={loading}
      error={error}
    />
  );
}

type OfferBookingCheckoutSectionProps = {
  offer: OfferRecord;
  customer: CustomerProfile | null;
  galleryImages: string[];
};

export function OfferBookingCheckoutSection({
  offer,
  customer,
  galleryImages,
}: OfferBookingCheckoutSectionProps) {
  const {
    step,
    draft,
    accommodations,
    selectedAccommodationId,
    goBackToAccommodation,
    confirmBooking,
    loading,
    error,
  } = useOfferBooking();

  if (step !== "checkout" || !draft || !selectedAccommodationId) return null;

  const accommodation = accommodations.find(
    (a) => a.id === selectedAccommodationId
  );
  if (!accommodation) return null;

  return (
    <BookingCheckoutForm
      offer={offer}
      draft={draft}
      accommodation={accommodation}
      galleryImages={galleryImages}
      customer={customer}
      offerId={offer.id}
      loading={loading}
      error={error}
      onBack={goBackToAccommodation}
      onConfirm={confirmBooking}
    />
  );
}

export function AccommodationScrollLink({
  children,
}: {
  children: React.ReactNode;
}) {
  const { step } = useOfferBooking();

  function handleClick() {
    const targetId =
      step === "dates" ? "offer-booking-panel" : "booking-flow";
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm font-medium text-brand-accent transition hover:text-orange-700 hover:underline"
    >
      {children}
    </button>
  );
}
