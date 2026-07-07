"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import CarouselNavButton from "@/components/CarouselNavButton";

type OfferCardImageCarouselProps = {
  images: string[];
  title: string;
  featured?: boolean;
};

export default function OfferCardImageCarousel({
  images,
  title,
  featured = false,
}: OfferCardImageCarouselProps) {
  const safeImages = useMemo(() => {
    const cleaned = images.map((s) => s.trim()).filter(Boolean);
    const unique = cleaned.filter((src, idx) => cleaned.indexOf(src) === idx);
    return unique.length ? unique.slice(0, 5) : ["/offers/montana-1.svg"];
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

  const sizes = featured
    ? "(max-width: 1024px) 100vw, 42vw"
    : "(max-width: 768px) 100vw, 50vw";

  return (
    <div className="group relative h-full w-full">
      <Image
        src={main}
        alt={title}
        fill
        className="object-cover"
        sizes={sizes}
      />

      {safeImages.length > 1 && (
        <>
          <CarouselNavButton
            direction="prev"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
          />
          <CarouselNavButton
            direction="next"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
          />

          <div className="absolute bottom-2 right-2 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm">
            {active + 1}/{safeImages.length}
          </div>
        </>
      )}
    </div>
  );
}

