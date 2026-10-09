"use client";

import { useEffect, useMemo, useState } from "react";
import { useGeofencing, type GeofenceZone } from "../hooks/useGeofencing";
import { useGeolocationFallback, type PanicAlert } from "../hooks/useGeolocationFallback";

type Relationship = "Father" | "Mother" | "Sibling" | "Spouse" | "Friend" | "Other";
type EmergencyContact = { name: string; number: string; relationship: Relationship };
const CONTACTS_STORAGE_KEY = "panicmode:emergency-contacts";
const SAMPLE_ZONES: GeofenceZone[] = [
  { lat: 28.6139, lng: 77.209, radius: 450, type: "safe", label: "Central Police Station" },
  { lat: 28.628, lng: 77.216, radius: 500, type: "safe", label: "Connaught Place Police Station" },
  { lat: 28.62, lng: 77.23, radius: 350, type: "danger", label: "Reported incident area" },
];

function readContacts(): EmergencyContact[] {
  const stored = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.flatMap((contact) => {
          if (!contact || typeof contact !== "object") return [];
          const value = contact as Partial<EmergencyContact>;
          if (typeof value.name !== "string" || typeof value.number !== "string") return [];
          return [{ name: value.name, number: value.number, relationship: value.relationship ?? "Other" }];
        })
      : [];
  } catch {
    window.localStorage.removeItem(CONTACTS_STORAGE_KEY);
    return [];
  }
}

function locationLink(location: { lat: number; lng: number } | null) {
  return location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : "Location unavailable";
}

export default function PanicMode() {
  const [mounted, setMounted] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("Other");
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setContacts(readContacts());
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };
  const saveContacts = (next: EmergencyContact[]) => {
    setContacts(next);
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(next));
  };
  const addContact = () => {
    const name = contactName.trim();
    const number = contactNumber.trim();
    if (!name || !number) return notify("Enter a name and phone number.");
    const nextContact = { name, number, relationship };
    saveContacts(editingContactIndex === null ? [...contacts, nextContact] : contacts.map((contact, index) => index === editingContactIndex ? nextContact : contact));
    setContactName("");
    setContactNumber("");
    setRelationship("Other");
    setEditingContactIndex(null);
  };
  const sendLocationToContacts = (sharedLocation = location) => {
    const message = `Emergency! I need help. My location: ${locationLink(sharedLocation)}`;
    if (navigator.share) void navigator.share({ title: "Emergency location", text: message }).catch(() => undefined);
    contacts.forEach((contact) => window.open(`sms:${encodeURIComponent(contact.number)}?body=${encodeURIComponent(message)}`, "_blank"));
  };
  const shareLocation = () => {
    if (!location) return notify("Requesting your location. Please try again when permission is granted.");
    const message = `My current location: ${locationLink(location)}`;
    if (navigator.share) {
      void navigator.share({ title: "My live location", text: message }).catch(() => undefined);
    } else {
      window.open(locationLink(location), "_blank");
    }
  };
  const onFlushAlerts = async (alerts: PanicAlert[]) => {
    alerts.forEach((alert) => sendLocationToContacts(alert.location));
    if (alerts.length) notify(`${alerts.length} offline panic alert(s) sent.`);
  };
  const { location, isFallback, isOffline, triggerPanicAlert } = useGeolocationFallback({ onFlushAlerts });
  const activeZones = useGeofencing(location, SAMPLE_ZONES, {
    onZoneEnter: (zone) => notify(`Entered ${zone.type} zone: ${zone.label}`),
    onZoneExit: (zone) => notify(`Exited ${zone.type} zone: ${zone.label}`),
  });
  const activeZoneLabel = useMemo(() => activeZones.map((zone) => zone.label).join(", "), [activeZones]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      triggerPanicAlert({ source: "panic-button" });
      if (contacts.length) sendLocationToContacts();
      window.location.href = "tel:112";
      setCountdown(null);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-red-600">Panic / SOS</h3>
          {mounted && isFallback ? <span className="mt-1 inline-flex rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700">Offline — using last known location</span> : null}
          {mounted && isOffline && !isFallback ? <p className="mt-1 text-xs opacity-75">Offline — location will sync when online.</p> : null}
        </div>
        {countdown === null ? (
          <button type="button" onClick={() => setCountdown(3)} className="animate-pulse rounded-full bg-red-600 px-6 py-3 font-extrabold text-white shadow-lg shadow-red-600/30">PANIC — CALL 112</button>
        ) : (
          <div className="flex items-center gap-3"><span className="text-lg font-bold text-red-600">Calling 112 in {countdown}...</span><button type="button" onClick={() => setCountdown(null)} className="rounded-full border border-red-600 px-4 py-2 font-semibold text-red-600">Cancel</button></div>
        )}
      </div>
      {activeZoneLabel ? <p className="mt-3 text-xs">Active zone: {activeZoneLabel}</p> : null}
      {toast ? <p role="status" className="mt-3 rounded-lg bg-[#0B1F3A] px-3 py-2 text-sm text-white">{toast}</p> : null}

      <div className="mt-4 rounded-lg border border-white/10 bg-[#122A4D] p-3">
        <h4 className="font-semibold">📍 Share My Live Location</h4>
        <p className="mt-1 text-xs opacity-80">Share your current coordinates with a trusted person.</p>
        <button type="button" onClick={shareLocation} className="mt-3 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white">Share Location</button>
      </div>

      <div className="mt-4 border-t border-red-500/20 pt-3">
        <p className="mb-2 text-sm font-semibold">Trusted Emergency Contacts</p>
        {contacts.length ? <div className="mb-3 grid gap-2 sm:grid-cols-2">{contacts.map((contact, index) => <div key={`${contact.number}-${index}`} className="flex items-center justify-between rounded-lg bg-black/5 p-3"><span>👤 <strong>{contact.name}</strong><br /><small>{contact.relationship} · {contact.number}</small></span><a href={`tel:${contact.number}`} className="rounded-full bg-[#128807] px-3 py-1 text-xs font-semibold text-white">Call</a></div>)}</div> : <p className="mb-3 text-xs opacity-75">No trusted contacts saved yet.</p>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Name" className="rounded-lg border px-2 py-2 text-sm" />
          <input value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="Phone number" inputMode="tel" className="rounded-lg border px-2 py-2 text-sm" />
          <select value={relationship} onChange={(event) => setRelationship(event.target.value as Relationship)} className="rounded-lg border px-2 py-2 text-sm"><option>Father</option><option>Mother</option><option>Sibling</option><option>Spouse</option><option>Friend</option><option>Other</option></select>
          <button type="button" onClick={addContact} className="rounded-lg bg-[#0B1F3A] px-3 py-2 text-sm font-semibold text-white">{editingContactIndex === null ? "Save" : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}
