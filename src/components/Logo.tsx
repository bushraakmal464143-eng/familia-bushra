import type { SiteBranding } from "@/lib/branding";

type LogoProps = {
  variant?: "light" | "dark";
  showText?: boolean;
  branding?: Pick<
    SiteBranding,
    "logoPart1" | "logoAccent" | "logoPart2" | "logoSuffix"
  >;
};

const defaultBranding = {
  logoPart1: "Ofertas",
  logoAccent: "de",
  logoPart2: "Camping",
  logoSuffix: ".com",
};

export default function Logo({
  variant = "dark",
  showText = true,
  branding,
}: LogoProps) {
  const logo = branding ?? defaultBranding;
  const textTone = variant === "light" ? "text-white" : "text-brand-forest";
  const accentTone = variant === "light" ? "text-brand-sun" : "text-brand-accent";

  return (
    <span className="inline-flex max-w-full items-center">
      {showText ? (
        <span
          className={`text-base font-extrabold leading-tight tracking-tight sm:text-lg ${textTone}`}
        >
          <span className="italic">{logo.logoPart1}</span>
          <span className={accentTone}>{logo.logoAccent}</span>
          <span className="italic">{logo.logoPart2}</span>
          <span className={`ml-0.5 text-[0.65rem] align-top sm:text-xs ${accentTone}`}>
            {logo.logoSuffix}
          </span>
        </span>
      ) : (
        <span
          aria-hidden
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black ${
            variant === "light"
              ? "border-white text-white"
              : "border-brand-green text-brand-forest"
          }`}
        >
          OC
        </span>
      )}
    </span>
  );
}
