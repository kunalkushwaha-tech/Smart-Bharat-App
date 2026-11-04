"use client";

import { useEffect, useState } from "react";

export default function OfflineBadge() {
  const [status, setStatus] = useState<"ready" | "offline" | "unsupported" | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!("serviceWorker" in navigator) || !("caches" in window)) {
        if (active) setStatus("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      const cached = Boolean(await caches.match("/") && await caches.match("/~offline"));
      if (active) setStatus(!navigator.onLine ? "offline" : registration?.active && cached ? "ready" : "unsupported");
    };
    const update = () => void check();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    navigator.serviceWorker.addEventListener("controllerchange", update);
    void check();
    return () => {
      active = false;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      navigator.serviceWorker.removeEventListener("controllerchange", update);
    };
  }, []);

  if (!status) return null;
  const text = status === "ready"
    ? "🟢 Ready for offline use"
    : status === "offline"
      ? "🟡 You are offline — saved data available"
      : "⚪ Offline use not available in this browser";
  return <p className="text-sm" aria-live="polite">{text}</p>;
}
