"use client";

import { useEffect, useMemo, useState } from "react";
import OfferLocationMap from "@/components/OfferLocationMap";
import { buildMapQuery, parseMapCoordinate } from "@/lib/offer-map";

type GeocodeResult = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: string;
};

type MapLocationPickerProps = {
  mapLabel: string;
  mapLat: string;
  mapLng: string;
  location: string;
  region: string;
  onMapLabelChange: (value: string) => void;
  onMapLatChange: (value: string) => void;
  onMapLngChange: (value: string) => void;
};

function parseGoogleMapsInput(input: string): {
  label?: string;
  lat?: number;
  lng?: number;
} | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const coordPatterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
  ];

  for (const pattern of coordPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { lat: Number(match[1]), lng: Number(match[2]) };
    }
  }

  if (/google\.com\/maps|maps\.google|goo\.gl\/maps/i.test(trimmed)) {
    return { label: trimmed };
  }

  return null;
}

export default function MapLocationPicker({
  mapLabel,
  mapLat,
  mapLng,
  location,
  region,
  onMapLabelChange,
  onMapLatChange,
  onMapLngChange,
}: MapLocationPickerProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState("");

  const parsedLat = parseMapCoordinate(mapLat, "lat");
  const parsedLng = parseMapCoordinate(mapLng, "lng");
  const hasCoordinates = parsedLat != null && parsedLng != null;
  const hasLocation = Boolean(
    mapLabel.trim() || buildMapQuery(undefined, location, region).trim()
  );

  const previewQuery = useMemo(
    () => buildMapQuery(mapLabel, location, region),
    [mapLabel, location, region]
  );

  useEffect(() => {
    const query = search.trim();
    if (query.length < 3) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/admin/geocode?q=${encodeURIComponent(query)}`
        );
        const data = (await res.json()) as {
          results?: GeocodeResult[];
          error?: string;
        };
        if (!res.ok) {
          setResults([]);
          setSearchError(data.error ?? "No se pudo buscar.");
          return;
        }
        setResults(data.results ?? []);
        if ((data.results ?? []).length === 0) {
          setSearchError("No se encontraron resultados. Prueba otra búsqueda.");
        }
      } catch {
        setResults([]);
        setSearchError("Error de conexión al buscar.");
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [search]);

  function applyResult(result: GeocodeResult) {
    onMapLabelChange(result.label);
    onMapLatChange(String(result.lat));
    onMapLngChange(String(result.lng));
    setSearch(result.label.split(",").slice(0, 2).join(","));
    setResults([]);
    setSearchError(null);
  }

  function clearLocation() {
    onMapLabelChange("");
    onMapLatChange("");
    onMapLngChange("");
    setSearch("");
    setResults([]);
    setPasteValue("");
    setSearchError(null);
  }

  function applyPastedLink() {
    const parsed = parseGoogleMapsInput(pasteValue);
    if (!parsed) {
      setSearchError("Pega un enlace de Google Maps o coordenadas lat, lng.");
      return;
    }
    if (parsed.lat != null && parsed.lng != null) {
      onMapLatChange(String(parsed.lat));
      onMapLngChange(String(parsed.lng));
      if (!mapLabel.trim()) {
        onMapLabelChange(`${parsed.lat}, ${parsed.lng}`);
      }
    } else if (parsed.label) {
      onMapLabelChange(parsed.label);
      setSearch(parsed.label);
    }
    setSearchError(null);
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Buscar ubicación</label>
        <input
          className={inputClass}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ej. Camping Vidrà, Benasque, Barcelona…"
        />
        <p className="mt-1 text-xs text-gray-500">
          Escribe como en Google Maps y elige un resultado de la lista.
        </p>
        {searching && (
          <p className="mt-2 text-xs text-gray-500">Buscando ubicaciones…</p>
        )}
        {searchError && (
          <p className="mt-2 text-xs text-amber-700">{searchError}</p>
        )}
        {results.length > 0 && (
          <ul className="mt-2 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => applyResult(result)}
                  className="w-full border-b border-gray-100 px-3 py-2.5 text-left text-sm transition last:border-b-0 hover:bg-orange-50"
                >
                  <span className="font-medium text-gray-900">
                    {result.label.split(",")[0]}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500 line-clamp-2">
                    {result.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className={labelClass}>
          O pega enlace de Google Maps / coordenadas
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="https://maps.google.com/... o 42.348, 1.944"
          />
          <button
            type="button"
            onClick={applyPastedLink}
            className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Usar enlace
          </button>
        </div>
      </div>

      {(hasLocation || hasCoordinates) && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Ubicación seleccionada
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {mapLabel.trim() || previewQuery}
              </p>
              {hasCoordinates && (
                <p className="mt-1 text-xs text-gray-500">
                  {parsedLat}, {parsedLng}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearLocation}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Quitar
            </button>
          </div>

          <div className="mt-4">
            <OfferLocationMap
              mapLabel={mapLabel}
              location={location}
              region={region}
              mapLat={parsedLat}
              mapLng={parsedLng}
            />
          </div>
        </div>
      )}

      <details className="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          Editar dirección manualmente
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Dirección mostrada</label>
            <input
              className={inputClass}
              value={mapLabel}
              onChange={(e) => onMapLabelChange(e.target.value)}
              placeholder="Dirección visible en la ficha"
            />
          </div>
          <div>
            <label className={labelClass}>Latitud</label>
            <input
              type="number"
              step="any"
              className={inputClass}
              value={mapLat}
              onChange={(e) => onMapLatChange(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Longitud</label>
            <input
              type="number"
              step="any"
              className={inputClass}
              value={mapLng}
              onChange={(e) => onMapLngChange(e.target.value)}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
