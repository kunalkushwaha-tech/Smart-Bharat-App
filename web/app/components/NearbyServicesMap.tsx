"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

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
  cyber: buildMarkerIcon("🛡️", "#0891b2"),
};

function MapResizeHandler({ triggerKey }: { triggerKey: string }) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const animationFrame = window.requestAnimationFrame(invalidate);
    const delayedInvalidate = window.setTimeout(invalidate, 200);
    window.addEventListener("resize", invalidate);

    const observer = new ResizeObserver(() => {
      invalidate();
    });
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

export default function NearbyServicesMap({ isDark }: NearbyServicesMapProps) {
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "loading" | "ready" | "denied" | "error" | "timeout">("idle");
  const [geoMessage, setGeoMessage] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const center = userLocation ?? DEFAULT_CENTER;

  const nearbyServices = useMemo<ServicePoint[]>(() => {
    const [baseLat, baseLng] = center;
    return [
      { id: "police-1", label: "Nearby Police Station", type: "police", position: [baseLat + 0.01, baseLng + 0.006] },
      { id: "hospital-1", label: "Nearby Government Hospital", type: "hospital", position: [baseLat - 0.012, baseLng + 0.005] },
      { id: "cyber-1", label: "Nearby Cybercrime Cell", type: "cyber", position: [baseLat + 0.007, baseLng - 0.008] },
    ];
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
