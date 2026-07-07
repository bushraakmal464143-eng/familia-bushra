export function parseMapCoordinate(
  value: unknown,
  type: "lat" | "lng"
): number | undefined {
  if (value == null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  if (type === "lat" && (num < -90 || num > 90)) return undefined;
  if (type === "lng" && (num < -180 || num > 180)) return undefined;
  return num;
}

export function buildMapQuery(
  mapLabel: string | undefined,
  location: string,
  region: string
): string {
  const label = mapLabel?.trim();
  if (label) return label;
  return [location, region].filter(Boolean).join(", ");
}

export function buildMapEmbedUrl(options: {
  mapLabel?: string;
  location: string;
  region: string;
  mapLat?: number;
  mapLng?: number;
}): string | null {
  const { mapLat, mapLng } = options;
  if (mapLat != null && mapLng != null) {
    const dLat = 0.02;
    const dLng = 0.03;
    const bbox = `${mapLng - dLng},${mapLat - dLat},${mapLng + dLng},${mapLat + dLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;
  }

  const query = buildMapQuery(options.mapLabel, options.location, options.region);
  if (!query.trim()) return null;

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
}

export function buildMapExternalUrl(options: {
  mapLabel?: string;
  location: string;
  region: string;
  mapLat?: number;
  mapLng?: number;
}): string | null {
  const { mapLat, mapLng } = options;
  if (mapLat != null && mapLng != null) {
    return `https://www.google.com/maps?q=${mapLat},${mapLng}`;
  }
  const query = buildMapQuery(options.mapLabel, options.location, options.region);
  if (!query.trim()) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}
