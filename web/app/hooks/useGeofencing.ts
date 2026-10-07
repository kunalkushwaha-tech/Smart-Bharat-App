"use client";

import { useEffect, useMemo, useRef } from "react";

import type { Location } from "./useGeolocationFallback";

export type GeofenceZone = {
  lat: number;
  lng: number;
  radius: number;
  type: "safe" | "danger";
  label: string;
};

export type GeofenceNotificationHandler = (zone: GeofenceZone) => void;

export type UseGeofencingOptions = {
  onZoneEnter?: GeofenceNotificationHandler;
  onZoneExit?: GeofenceNotificationHandler;
};

const EARTH_RADIUS_METERS = 6_371_000;

export function haversineDistance(
  from: Pick<Location, "lat" | "lng">,
  to: Pick<Location, "lat" | "lng">,
): number {
  const latitudeDifference = ((to.lat - from.lat) * Math.PI) / 180;
  const longitudeDifference = ((to.lng - from.lng) * Math.PI) / 180;
  const fromLatitude = (from.lat * Math.PI) / 180;
  const toLatitude = (to.lat * Math.PI) / 180;
  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.sin(longitudeDifference / 2) ** 2 * Math.cos(fromLatitude) * Math.cos(toLatitude);

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function useGeofencing(
  location: Location | null,
  zones: GeofenceZone[],
  options: UseGeofencingOptions = {},
): GeofenceZone[] {
  const previousActiveZonesRef = useRef<GeofenceZone[]>([]);
  const onZoneEnterRef = useRef(options.onZoneEnter);
  const onZoneExitRef = useRef(options.onZoneExit);

  useEffect(() => {
    onZoneEnterRef.current = options.onZoneEnter;
    onZoneExitRef.current = options.onZoneExit;
  }, [options.onZoneEnter, options.onZoneExit]);

  const activeZones = useMemo(() => {
    if (!location) return [];
    return zones.filter((zone) => haversineDistance(location, zone) <= zone.radius);
  }, [location, zones]);

  useEffect(() => {
    const previousZones = previousActiveZonesRef.current;
    const previousZoneLabels = new Set(previousZones.map((zone) => zone.label));
    const activeZoneLabels = new Set(activeZones.map((zone) => zone.label));

    activeZones.forEach((zone) => {
      if (!previousZoneLabels.has(zone.label)) onZoneEnterRef.current?.(zone);
    });
    previousZones.forEach((zone) => {
      if (!activeZoneLabels.has(zone.label)) onZoneExitRef.current?.(zone);
    });
    previousActiveZonesRef.current = activeZones;
  }, [activeZones]);

  return activeZones;
}
