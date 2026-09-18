"use client";

import { useEffect, useMemo, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useGeolocationFallback } from "../hooks/useGeolocationFallback";

type NearbyServicesMapProps = { isDark: boolean };
type Category = "hospital" | "police" | "fire" | "pharmacy";
type ServicePoint = { id: string; label: string; type: Category; position: LatLngTuple };
const DEFAULT_CENTER: LatLngTuple = [28.6139, 77.209];
const categories: Array<{ id: Category; label: string; amenity: string }> = [
  { id: "hospital", label: "Hospitals", amenity: "hospital" },
  { id: "police", label: "Police Stations", amenity: "police" },
  { id: "fire", label: "Fire Stations", amenity: "fire_station" },
  { id: "pharmacy", label: "Pharmacies", amenity: "pharmacy" },
];
const categoryByAmenity: Record<string, Category> = { hospital: "hospital", police: "police", fire_station: "fire", pharmacy: "pharmacy" };
function buildMarkerIcon(emoji: string, background: string) {
  return L.divIcon({ className: "", html: `<div style="width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:${background};color:white;font-size:15px;border:2px solid white">${emoji}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
}
const iconByType = {
  user: buildMarkerIcon("📍", "#2563eb"),
  hospital: buildMarkerIcon("🏥", "#16a34a"),
  police: buildMarkerIcon("👮", "#dc2626"),
  fire: buildMarkerIcon("🚒", "#ea580c"),
  pharmacy: buildMarkerIcon("💊", "#0891b2"),
};
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => { const invalidate = () => map.invalidateSize(); const frame = requestAnimationFrame(invalidate); window.addEventListener("resize", invalidate); return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", invalidate); }; }, [map]);
  return null;
}
export default function NearbyServicesMap({ isDark }: NearbyServicesMapProps) {
  const { location } = useGeolocationFallback();
  const [selectedCategory, setSelectedCategory] = useState<Category>("hospital");
  const [points, setPoints] = useState<ServicePoint[]>([]);
  const [message, setMessage] = useState("");
  const center: LatLngTuple = location ? [location.lat, location.lng] : DEFAULT_CENTER;

  useEffect(() => {
    const [lat, lng] = center;
    const query = `[out:json][timeout:15];(nwr["amenity"="hospital"](around:5000,${lat},${lng});nwr["amenity"="police"](around:5000,${lat},${lng});nwr["amenity"="fire_station"](around:5000,${lat},${lng});nwr["amenity"="pharmacy"](around:5000,${lat},${lng}););out center tags;`;
    const controller = new AbortController();
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Nearby services unavailable.");
        const data = await response.json() as { elements?: Array<{ id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> };
        const next = (data.elements ?? []).flatMap((element) => {
          const latValue = element.lat ?? element.center?.lat;
          const lngValue = element.lon ?? element.center?.lon;
          const amenity = element.tags?.amenity;
          if (latValue === undefined || lngValue === undefined || !amenity || !["hospital", "police", "fire_station", "pharmacy"].includes(amenity)) return [];
          const type = categoryByAmenity[amenity];
          return [{ id: String(element.id), label: element.tags?.name ?? categories.find((category) => category.amenity === amenity)?.label ?? "Nearby service", type, position: [latValue, lngValue] as LatLngTuple }];
        });
        setPoints(next);
      })
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setMessage(error instanceof Error ? error.message : "Nearby services unavailable."); });
    return () => controller.abort();
  }, [center]);

  const visiblePoints = useMemo(() => points.filter((point) => point.type === selectedCategory), [points, selectedCategory]);
  return (
    <div className={`mt-5 rounded-xl border p-4 ${isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">Nearby Help</h3><span className="text-xs opacity-75">Within 5 km</span></div>
      <div className="mb-3 flex flex-wrap gap-2">{categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedCategory === category.id ? "bg-[#FF9933] text-white" : "bg-[#122A4D] text-white"}`}>{category.label}</button>)}</div>
      {message ? <p className="mb-3 text-sm text-[#ffb0b0]">{message}</p> : null}
      {!location ? <p className="mb-3 text-sm opacity-80">Allow location access to load nearby help. Showing Delhi as the map fallback.</p> : null}
      <div className="h-[320px] w-full overflow-hidden rounded-lg border border-white/15">
        <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={13} scrollWheelZoom className="h-full w-full" style={{ height: "100%", width: "100%" }}>
          <MapResizeHandler />
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {location ? <Marker position={[location.lat, location.lng]} icon={iconByType.user}><Popup>Your current location</Popup></Marker> : null}
          {visiblePoints.map((point) => <Marker key={point.id} position={point.position} icon={iconByType[point.type]}><Popup>{point.label}</Popup></Marker>)}
        </MapContainer>
      </div>
      <p className="mt-2 text-xs opacity-75">{visiblePoints.length} {categories.find((category) => category.id === selectedCategory)?.label.toLowerCase() ?? "services"} found.</p>
    </div>
  );
}
