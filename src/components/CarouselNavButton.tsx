import type { MouseEvent } from "react";

type CarouselNavButtonProps = {
  direction: "prev" | "next";
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "md";
};

export default function CarouselNavButton({
  direction,
  onClick,
  size = "md",
}: CarouselNavButtonProps) {
  const isPrev = direction === "prev";
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const posClass = isPrev
    ? size === "sm"
      ? "left-2.5"
      : "left-4"
    : size === "sm"
      ? "right-2.5"
      : "right-4";
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Imagen anterior" : "Imagen siguiente"}
      className={`absolute top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-brand-forest shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-200 opacity-95 hover:scale-105 hover:bg-white hover:opacity-100 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${sizeClass} ${posClass}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={isPrev ? "" : "rotate-180"}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
