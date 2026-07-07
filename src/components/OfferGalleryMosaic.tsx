"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import CarouselNavButton from "@/components/CarouselNavButton";

const FALLBACKS = [
  "/offers/montana-1.svg",
  "/offers/montana-2.svg",
  "/offers/montana-3.svg",
  "/offers/montana-4.svg",
  "/offers/montana-5.svg",
];

type OfferGalleryMosaicProps = {
  title: string;
  images: string[];
};

function uniqueImages(images: string[]) {
  const cleaned = images.map((s) => s.trim()).filter(Boolean);
  return cleaned.filter((src, idx) => cleaned.indexOf(src) === idx);
}

export default function OfferGalleryMosaic({ title, images }: OfferGalleryMosaicProps) {
  const all = useMemo(() => {
    const uniq = uniqueImages(images);
    return uniq.length ? uniq : FALLBACKS;
  }, [images]);

  const preview = useMemo(() => {
    const uniq = uniqueImages(images);
    const base = uniq.length ? uniq : [];
    const filled = [...base, ...FALLBACKS].filter(Boolean);
    const unique = filled.filter((src, idx) => filled.indexOf(src) === idx);
    return unique.slice(0, 5);
  }, [images]);

  const total = all.length;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  function close() {
    setOpen(false);
  }

  function openAt(idx: number) {
    setActive(idx);
    setOpen(true);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:grid-rows-3 md:h-[420px] lg:h-[480px]">
          <button
            type="button"
            onClick={() => openAt(0)}
            className="relative aspect-[16/10] overflow-hidden bg-gray-100 md:col-span-7 md:row-span-2 md:aspect-auto md:h-full md:min-h-0"
            aria-label="Ver fotos"
          >
            <Image
              src={preview[0]}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 58vw"
              priority
            />
          </button>

          <button
            type="button"
            onClick={() => openAt(1)}
            className="relative aspect-[16/10] overflow-hidden bg-gray-100 md:col-span-5 md:col-start-8 md:row-start-1 md:aspect-auto md:h-full md:min-h-0"
            aria-label="Ver fotos"
          >
            <Image
              src={preview[1]}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
          </button>

          <button
            type="button"
            onClick={() => openAt(2)}
            className="relative aspect-[16/10] overflow-hidden bg-gray-100 md:col-span-5 md:col-start-8 md:row-start-2 md:aspect-auto md:h-full md:min-h-0"
            aria-label="Ver fotos"
          >
            <Image
              src={preview[2]}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
          </button>

          <button
            type="button"
            onClick={() => openAt(3)}
            className="relative aspect-[16/10] overflow-hidden bg-gray-100 md:col-span-7 md:row-start-3 md:aspect-auto md:h-full md:min-h-0"
            aria-label="Ver fotos"
          >
            <Image
              src={preview[3]}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
          </button>

          <button
            type="button"
            onClick={() => openAt(4)}
            className="group relative aspect-[16/10] overflow-hidden bg-gray-100 md:col-span-5 md:col-start-8 md:row-start-3 md:aspect-auto md:h-full md:min-h-0"
            aria-label="Ver más fotos"
          >
            <Image
              src={preview[4]}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
            <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow backdrop-blur">
                Ver {total} fotos
              </span>
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Galería de fotos"
          className="fixed inset-0 z-[200] bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold text-gray-900">
                {title} · {active + 1}/{total}
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-full px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>

            <div className="relative flex-1 bg-black">
              <div className="group relative h-full w-full">
                <Image
                  src={all[active]}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
                {total > 1 && (
                  <>
                    <CarouselNavButton
                      direction="prev"
                      onClick={(e) => {
                        e.preventDefault();
                        setActive((v) => (v - 1 + total) % total);
                      }}
                    />
                    <CarouselNavButton
                      direction="next"
                      onClick={(e) => {
                        e.preventDefault();
                        setActive((v) => (v + 1) % total);
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="max-h-[45vh] overflow-auto border-t border-gray-100 bg-white p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8">
                {all.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                      idx === active ? "ring-2 ring-brand-accent" : ""
                    }`}
                    aria-label={`Abrir foto ${idx + 1}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

