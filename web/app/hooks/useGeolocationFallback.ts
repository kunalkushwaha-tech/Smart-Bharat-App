"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Location = {
  lat: number;
  lng: number;
  timestamp: number;
};

export type PanicAlert = {
  id?: string;
  timestamp?: number;
  location?: Location | null;
  [key: string]: unknown;
};

export type PanicAlertFlushHandler = (alerts: PanicAlert[]) => void | Promise<void>;

export type UseGeolocationFallbackOptions = {
  onFlushAlerts?: PanicAlertFlushHandler;
  watchOptions?: PositionOptions;
};

export type UseGeolocationFallbackResult = {
  location: Location | null;
  isFallback: boolean;
  isOffline: boolean;
  error: GeolocationPositionError | null;
  pendingAlertCount: number;
  triggerPanicAlert: (alert?: Omit<PanicAlert, "location" | "timestamp">) => void;
};

const LOCATION_STORAGE_KEY = "panicmode:last-known-location";
const ALERT_QUEUE_STORAGE_KEY = "panicmode:offline-alert-queue";

function readCachedLocation(): Location | null {
  const value = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Location).lat === "number" &&
      typeof (parsed as Location).lng === "number" &&
      typeof (parsed as Location).timestamp === "number"
    ) {
      return parsed as Location;
    }
  } catch {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  }
  return null;
}

function readQueuedAlerts(): PanicAlert[] {
  const value = window.localStorage.getItem(ALERT_QUEUE_STORAGE_KEY);
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PanicAlert[]) : [];
  } catch {
    window.localStorage.removeItem(ALERT_QUEUE_STORAGE_KEY);
    return [];
  }
}

export function useGeolocationFallback(
  options: UseGeolocationFallbackOptions = {},
): UseGeolocationFallbackResult {
  const onFlushAlertsRef = useRef(options.onFlushAlerts);
  const [location, setLocation] = useState<Location | null>(() =>
    typeof window === "undefined" ? null : readCachedLocation(),
  );
  const [isFallback, setIsFallback] = useState(() =>
    typeof window !== "undefined" && readCachedLocation() !== null,
  );
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [pendingAlertCount, setPendingAlertCount] = useState(() =>
    typeof window === "undefined" ? 0 : readQueuedAlerts().length,
  );

  useEffect(() => {
    onFlushAlertsRef.current = options.onFlushAlerts;
  }, [options.onFlushAlerts]);

  const flushQueuedAlerts = useCallback(async () => {
    const queuedAlerts = readQueuedAlerts();
    if (queuedAlerts.length === 0 || !onFlushAlertsRef.current) return;

    // Keep queued alerts until the consumer confirms delivery. This prevents
    // an online event during a failed request from silently losing panic alerts.
    await onFlushAlertsRef.current(queuedAlerts);
    window.localStorage.removeItem(ALERT_QUEUE_STORAGE_KEY);
    setPendingAlertCount(0);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      void flushQueuedAlerts();
    };
    const handleOffline = () => {
      setIsOffline(true);
      const cached = readCachedLocation();
      if (cached) {
        setLocation(cached);
        setIsFallback(true);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.geolocation) {
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        };
        window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
        setLocation(nextLocation);
        setIsFallback(false);
        setError(null);
      },
      (geolocationError) => {
        setError(geolocationError);
        const cached = readCachedLocation();
        if (cached) {
          setLocation(cached);
          setIsFallback(true);
        }
      },
      options.watchOptions,
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushQueuedAlerts, options.watchOptions]);

  const triggerPanicAlert = useCallback(
    (alert: Omit<PanicAlert, "location" | "timestamp"> = {}) => {
      const panicAlert: PanicAlert = {
        ...alert,
        location,
        timestamp: Date.now(),
      };

      if (!navigator.onLine) {
        const queuedAlerts = [...readQueuedAlerts(), panicAlert];
        window.localStorage.setItem(ALERT_QUEUE_STORAGE_KEY, JSON.stringify(queuedAlerts));
        setPendingAlertCount(queuedAlerts.length);
        return;
      }

      if (onFlushAlertsRef.current) {
        void onFlushAlertsRef.current([panicAlert]);
      }
    },
    [location],
  );

  return { location, isFallback, isOffline, error, pendingAlertCount, triggerPanicAlert };
}
