import {
  buildMapEmbedUrl,
  buildMapExternalUrl,
  buildMapQuery,
} from "@/lib/offer-map";

type OfferLocationMapProps = {
  mapLabel?: string;
  location: string;
  region: string;
  mapLat?: number;
  mapLng?: number;
};

export default function OfferLocationMap({
  mapLabel,
  location,
  region,
  mapLat,
  mapLng,
}: OfferLocationMapProps) {
  const embedUrl = buildMapEmbedUrl({
    mapLabel,
    location,
    region,
    mapLat,
    mapLng,
  });
  const externalUrl = buildMapExternalUrl({
    mapLabel,
    location,
    region,
    mapLat,
    mapLng,
  });
  const label = buildMapQuery(mapLabel, location, region);

  if (!embedUrl || !externalUrl) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        Ubicación no disponible
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <iframe
        title={`Mapa — ${label}`}
        src={embedUrl}
        className="h-64 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-white px-4 py-3 text-sm">
        <p className="font-medium text-gray-800">{label}</p>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-accent hover:underline"
        >
          Abrir en Google Maps →
        </a>
      </div>
    </div>
  );
}
