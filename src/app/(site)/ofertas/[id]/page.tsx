import Image from "next/image";
import { notFound } from "next/navigation";
import OfferLocationMap from "@/components/OfferLocationMap";
import OfferGalleryMosaic from "@/components/OfferGalleryMosaic";
import {
  OfferBookingAccommodationSection,
  OfferBookingCheckoutSection,
  OfferBookingProvider,
  OfferBookingSidebar,
  AccommodationScrollLink,
} from "@/components/OfferBookingFlow";
import { getOfferById, getPublicOffers } from "@/lib/offers-store";
import { getCampingById, stripCampingSecrets } from "@/lib/campings-store";
import { getCurrentCustomer } from "@/lib/current-customer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OfertaDetailPage({ params }: Props) {
  const { id } = await params;
  const offer = await getOfferById(id);
  const publicOffers = await getPublicOffers();
  if (!offer || !publicOffers.some((o) => o.id === id)) notFound();

  const camping = await getCampingById(offer.campingId);
  const customer = await getCurrentCustomer();
  const accommodationName =
    offer.accommodationName?.trim() ||
    (camping ? stripCampingSecrets(camping).name : offer.subtitle);
  const accommodationLinkText =
    offer.accommodationLinkText?.trim() || "Ver alojamiento →";
  const ctaTextTemplate =
    offer.ctaText?.trim() || "Ver fechas desde {price} €/persona";
  const ctaText = ctaTextTemplate.replaceAll("{price}", String(offer.priceFrom));
  const countdownProgress =
    offer.countdownProgress != null
      ? Math.max(0, Math.min(100, offer.countdownProgress))
      : 75;

  const allImages = (() => {
    const placeholders = [
      "/offers/montana-1.svg",
      "/offers/montana-2.svg",
      "/offers/montana-3.svg",
      "/offers/montana-4.svg",
      "/offers/montana-5.svg",
    ];

    const raw = [offer.image, ...(offer.gallery ?? [])].filter(Boolean) as string[];
    const unique = raw.filter((src, idx) => raw.indexOf(src) === idx);
    const withFallbacks = [...unique, ...placeholders].filter(Boolean) as string[];
    const finalUnique = withFallbacks.filter(
      (src, idx) => withFallbacks.indexOf(src) === idx
    );
    return finalUnique;
  })();

  return (
    <OfferBookingProvider
      offer={offer}
      customer={customer}
      ctaText={ctaText}
      countdown={offer.countdown}
      countdownProgress={countdownProgress}
      galleryImages={allImages}
    >
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {offer.title}
        </h1>
        {camping && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-brand-forest">
              {stripCampingSecrets(camping).name}
            </span>{" "}
            · {offer.location}, {offer.region}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <OfferGalleryMosaic images={allImages} title={offer.title} />

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Descubre tu alojamiento
            </h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={allImages[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {accommodationName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {offer.location}, {offer.region}
                  </p>
                  {offer.mealPlan && (
                    <p className="mt-1 text-sm text-gray-600">{offer.mealPlan}</p>
                  )}
                </div>
              </div>
              <AccommodationScrollLink>
                {accommodationLinkText}
              </AccommodationScrollLink>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">¿Dónde está?</h2>
            <div className="mt-4">
              <OfferLocationMap
                mapLabel={offer.mapLabel}
                location={offer.location}
                region={offer.region}
                mapLat={offer.mapLat}
                mapLng={offer.mapLng}
              />
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              ¿Qué disfrutarás en tu escapada?
            </h2>
            <div className="mt-4 rounded-xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Esta oferta incluye
              </h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {offer.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-gray-700">{offer.description}</p>
            </div>
          </section>

          <section className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <span aria-hidden className="text-xl">
              📅
            </span>
            <p className="text-sm text-gray-700">
              Fechas para viajar: <span className="font-semibold">{offer.travelDates}</span>
            </p>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div id="offer-booking-panel" className="sticky top-6">
            <OfferBookingSidebar
              offer={offer}
              customer={customer}
              ctaText={ctaText}
              countdown={offer.countdown}
              countdownProgress={countdownProgress}
            />
          </div>
        </aside>
      </div>

      <div id="booking-flow" className="pb-8">
        <OfferBookingAccommodationSection offer={offer} />
        <OfferBookingCheckoutSection
          offer={offer}
          customer={customer}
          galleryImages={allImages}
        />
      </div>
    </div>
    </OfferBookingProvider>
  );
}
