"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import CarouselNavButton from "@/components/CarouselNavButton";

type OfferImageCarouselProps = {
  images: string[];
  title: string;
};

export default function OfferImageCarousel({
  images,
  title,
}: OfferImageCarouselProps) {
  const safeImages = useMemo(() => {
    const cleaned = images.map((s) => s.trim()).filter(Boolean);
    const unique = cleaned.filter((src, idx) => cleaned.indexOf(src) === idx);
    return unique.length ? unique : ["/offers/montana-1.svg"];
  }, [images]);

  const [active, setActive] = useState(0);

  const go = useCallback(
    (delta: number) => {
      setActive((prev) => {
        const next = (prev + delta) % safeImages.length;
        return next < 0 ? next + safeImages.length : next;
      });
    },
    [safeImages.length]
  );

  const main = safeImages[active] ?? safeImages[0];
  const thumbs = safeImages.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="group relative aspect-[16/10] sm:aspect-[16/12] sm:col-span-2">
          <Image
            src={main}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />

          {safeImages.length > 1 && (
            <>
              <CarouselNavButton
                direction="prev"
                onClick={(e) => {
                  e.preventDefault();
                  go(-1);
                }}
              />
              <CarouselNavButton
                direction="next"
                onClick={(e) => {
                  e.preventDefault();
                  go(1);
                }}
              />
            </>
          )}

          <div className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
            {active + 1}/{safeImages.length}
          </div>
        </div>

        {thumbs.slice(1, 5).map((photo, idx) => {
          const realIndex = idx + 1;
          const isActive = active === realIndex;
          return (
            <button
              key={`${photo}-${idx}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActive(realIndex);
              }}
              aria-label={`Ver imagen ${realIndex + 1}`}
              className={`relative aspect-[16/10] overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                isActive ? "ring-2 ring-brand-accent" : ""
              }`}
            >
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 30vw"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

