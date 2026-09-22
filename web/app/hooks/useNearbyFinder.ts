"use client";

import { useMemo } from "react";

import type { Location } from "./useGeolocationFallback";
import { haversineDistance } from "./useGeofencing";

export type NearbyCategory = "police" | "hospital" | "cybercrime";

export type NearbyPoint = {
  lat: number;
  lng: number;
  name: string;
  category: NearbyCategory;
};

export type NearbyPointWithDistance = NearbyPoint & {
  distance: number;
};

export function useNearbyFinder(
  location: Location | null,
  category: NearbyCategory,
  points: NearbyPoint[],
): NearbyPointWithDistance[] {
  return useMemo(() => {
    if (!location) return [];

    return points
      .filter((point) => point.category === category)
      .map((point) => ({
        ...point,
        distance: haversineDistance(location, point),
      }))
      .sort((first, second) => first.distance - second.distance);
  }, [category, location, points]);
}
