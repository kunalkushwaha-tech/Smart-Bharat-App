"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useGeolocationFallback } from "../hooks/useGeolocationFallback";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

type NearbyServicesMapProps = {
  isDark: boolean;
};

type ServicePoint = {
  id: string;
  label: string;
  type: "police" | "hospital" | "cyber";
  position: LatLngTuple;
};

type MapErrorBoundaryState = { hasError: boolean };

class MapErrorBoundary extends Component<{ children: ReactNode; isDark: boolean }, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Nearby emergency map failed to render", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`rounded-lg border p-5 text-sm ${this.props.isDark ? "border-red-300/30 bg-[#351522] text-red-100" : "border-red-300 bg-red-50 text-red-900"}`}>
          <p className="font-semibold">Emergency map is unavailable right now.</p>
          <p className="mt-1">Use the emergency call buttons above or try refreshing this section later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "loading" | "ready" | "denied" | "error" | "timeout">("idle");
  const [geoMessage, setGeoMessage] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

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

  useEffect(() => {
    console.log("Map component mounted. Initial geo state:", geoState);
    if (typeof window === "undefined") return;

    const timeoutId = window.setTimeout(() => {
      if (geoState === "loading") {
        console.warn("Map geo fetch exceeded 10s timeout");
        setGeoState("timeout");
        setGeoMessage("Couldn't load map. Please try again or use the emergency helpline buttons above.");
      }
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [geoState]);

  useEffect(() => {
    console.log("Map render check: ready", mapReady, "geoState", geoState, "userLocation", userLocation);
    if (geoState === "ready" || geoState === "denied" || geoState === "error" || geoState === "timeout") {
      setMapReady(true);
    }
  }, [geoState, userLocation, mapReady]);

  const fetchLocation = () => {
    console.log("fetchLocation called");

    if (!navigator.geolocation) {
      console.error("Geolocation unsupported");
      setGeoState("error");
      setGeoMessage("Geolocation is not supported in this browser.");
      setMapLoadError("Geolocation is not supported in this browser.");
      return;
    }

    setUserLocation(null);
    setGeoState("loading");
    setGeoMessage("");
    setMapLoadError(null);
    setMapReady(false);

    const startedAt = Date.now();
    const timeoutId = window.setTimeout(() => {
      console.warn("Location fetch timed out after 10s", { elapsedMs: Date.now() - startedAt });
      setGeoState("timeout");
      setGeoMessage("Couldn't load map. Please try again or use the emergency helpline buttons above.");
      setMapLoadError("Location lookup timed out. Please try again.");
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location fetch succeeded", position.coords);
        window.clearTimeout(timeoutId);
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setGeoState("ready");
        setMapLoadError(null);
      },
      (error) => {
        console.error("Location fetch failed", error);
        window.clearTimeout(timeoutId);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoState("denied");
          setGeoMessage("Location permission denied. Showing demo nearby services for reference.");
          setMapLoadError("Location permission denied.");
          return;
        }
        setGeoState("error");
        setGeoMessage("Unable to fetch your location right now. Showing demo nearby services.");
        setMapLoadError("Unable to fetch your location right now.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const shouldShowMap = geoState === "ready" || geoState === "denied" || geoState === "error" || geoState === "timeout";

  return (
    <div
      className={`mt-5 rounded-xl border p-4 ${
        isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-[#F9FBFF]"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Nearby Emergency Services</h3>
        <button
          type="button"
          onClick={fetchLocation}
          className="rounded-full bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
          disabled={geoState === "loading"}
        >
          {geoState === "loading" ? "Locating..." : "Use My Location"}
        </button>
      </div>

      {(geoState === "denied" || geoState === "error" || geoState === "timeout") && geoMessage ? (
        <p className="mb-3 text-sm text-[#ffb0b0]">{geoMessage}</p>
      ) : null}

      {geoState === "idle" ? (
        <p className="mb-3 text-sm opacity-80">
          Tap &quot;Use My Location&quot; to show your current position and nearby services.
        </p>
      ) : null}

      {geoState === "loading" ? (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Emergency map is loading...
        </div>
      ) : null}

      {shouldShowMap ? (
        <MapErrorBoundary isDark={isDark}>
          <div className="w-full h-[320px] overflow-hidden rounded-lg border border-white/15">
            <MapContainer
              key={`${center[0]}-${center[1]}`}
              center={center}
              zoom={13}
              scrollWheelZoom
              className="w-full h-full"
              style={{ height: "100%", width: "100%" }}
              whenReady={() => {
                console.log("MapContainer ready");
                setMapReady(true);
              }}
            >
              <MapResizeHandler triggerKey={`${center[0]}-${center[1]}-${geoState}`} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation ? (
                <Marker position={userLocation} icon={iconByType.user} alt="Your current location">
                  <Popup>Your current location</Popup>
                </Marker>
              ) : null}

              {nearbyServices.map((service) => (
                <Marker key={service.id} position={service.position} icon={iconByType[service.type]} alt={service.label}>
                  <Popup>{service.label}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </MapErrorBoundary>
      ) : null}

      {mapLoadError ? <p className="mt-3 text-sm text-[#ffb0b0]">{mapLoadError}</p> : null}
    </div>
  );
}
