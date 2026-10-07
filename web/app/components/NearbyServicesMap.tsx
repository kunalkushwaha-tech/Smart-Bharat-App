"use client";

import { useEffect, useMemo, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { useNearbyFinder, type NearbyPoint } from "../hooks/useNearbyFinder";
import { useGeolocationFallback } from "../hooks/useGeolocationFallback";

type NearbyServicesMapProps = {
  isDark: boolean;
};

const DEFAULT_CENTER: LatLngTuple = [28.6139, 77.209];
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function buildMarkerIcon(emoji: string, background: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:${background};color:white;font-size:15px;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

const iconByType = {
  user: buildMarkerIcon("📍", "#2563eb"),
  police: buildMarkerIcon("👮", "#dc2626"),
  hospital: buildMarkerIcon("🏥", "#16a34a"),
  cybercrime: buildMarkerIcon("🛡️", "#0891b2"),
};

function MapResizeHandler({ triggerKey }: { triggerKey: string }) {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const animationFrame = window.requestAnimationFrame(invalidate);
    const delayedInvalidate = window.setTimeout(invalidate, 200);
    window.addEventListener("resize", invalidate);
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(delayedInvalidate);
      window.removeEventListener("resize", invalidate);
      observer.disconnect();
    };
  }, [map, triggerKey]);
  return null;
}

function formatDistance(distance: number): string {
  return distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`;
}

export default function NearbyServicesMap({ isDark }: NearbyServicesMapProps) {
  const { location, isFallback } = useGeolocationFallback();
  const [points, setPoints] = useState<NearbyPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const center: LatLngTuple = location ? [location.lat, location.lng] : DEFAULT_CENTER;

  useEffect(() => {
    if (!location) return;
    const controller = new AbortController();
    const query = `[out:json][timeout:15];(nwr["amenity"="police"](around:5000,${location.lat},${location.lng});nwr["amenity"="hospital"](around:5000,${location.lat},${location.lng}););out center tags;`;
    queueMicrotask(() => {
      setIsLoading(true);
      setFetchError(null);
    });

    fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Overpass request failed");
        const data: { elements?: Array<{ id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> } = await response.json();
        const nextPoints = (data.elements ?? []).flatMap((element) => {
          const lat = element.lat ?? element.center?.lat;
          const lng = element.lon ?? element.center?.lon;
          const category = element.tags?.amenity;
          if (lat === undefined || lng === undefined || (category !== "police" && category !== "hospital")) return [];
          return [{ lat, lng, category, name: element.tags?.name ?? (category === "police" ? "Police station" : "Hospital") } satisfies NearbyPoint];
        });
        setPoints(nextPoints);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFetchError("Nearby services could not be loaded. Try again later.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [location]);

  const police = useNearbyFinder(location, "police", points);
  const hospitals = useNearbyFinder(location, "hospital", points);
  const nearbyServices = useMemo(() => [...police, ...hospitals].sort((a, b) => a.distance - b.distance), [hospitals, police]);

  return (
    <div className={`mt-5 rounded-xl border p-4 ${isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Nearby Emergency Services</h3>
          <p className="text-xs opacity-75">Live OpenStreetMap data within 5 km</p>
        </div>
        {isFallback ? <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700">Using last known location</span> : null}
      </div>
      {isLoading ? <p className="mb-3 text-sm opacity-80">Loading nearby police stations and hospitals...</p> : null}
      {fetchError ? <p className="mb-3 text-sm text-[#b42318]">{fetchError}</p> : null}
      {!isLoading && !fetchError && location && nearbyServices.length === 0 ? <p className="mb-3 text-sm opacity-80">No police stations or hospitals found within 5 km.</p> : null}
      {!location ? <p className="mb-3 text-sm opacity-80">Allow location access to find nearby services.</p> : null}

      {nearbyServices.length > 0 ? (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {nearbyServices.map((service) => (
            <div key={`${service.category}-${service.lat}-${service.lng}`} className="rounded-lg border border-black/10 p-2 text-sm">
              <p className="font-semibold">{service.name}</p>
              <p className="text-xs opacity-75">{service.category} · {formatDistance(service.distance)}</p>
              <a className="text-xs font-semibold text-[#2563eb] underline" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}>Get Directions</a>
            </div>
          ))}
        </div>
      ) : null}

      <div className="h-[320px] w-full overflow-hidden rounded-lg border border-white/15">
        <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={13} scrollWheelZoom className="h-full w-full" style={{ height: "100%", width: "100%" }}>
          <MapResizeHandler triggerKey={`${center[0]}-${center[1]}`} />
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {location ? <Marker position={[location.lat, location.lng]} icon={iconByType.user}><Popup>Your current location</Popup></Marker> : null}
          {nearbyServices.map((service) => (
            <Marker key={`${service.category}-${service.lat}-${service.lng}`} position={[service.lat, service.lng]} icon={iconByType[service.category]}>
              <Popup>
                <strong>{service.name}</strong><br />
                {formatDistance(service.distance)} away<br />
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`} target="_blank" rel="noopener noreferrer">Get Directions</a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
