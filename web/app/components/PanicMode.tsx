"use client";

import { useMemo, useState } from "react";

import { useGeofencing, type GeofenceZone } from "../hooks/useGeofencing";
import { useGeolocationFallback, type PanicAlert } from "../hooks/useGeolocationFallback";

type EmergencyContact = {
  name: string;
  number: string;
};

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
    return Array.isArray(parsed) ? (parsed as EmergencyContact[]) : [];
  } catch {
    window.localStorage.removeItem(CONTACTS_STORAGE_KEY);
    return [];
  }
}

function locationLink(location: { lat: number; lng: number } | null): string {
  return location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : "Location unavailable";
}

export default function PanicMode() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() =>
    typeof window === "undefined" ? [] : readContacts(),
  );
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const saveContacts = (nextContacts: EmergencyContact[]) => {
    setContacts(nextContacts);
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(nextContacts));
  };

  const addContact = () => {
    const name = contactName.trim();
    const number = contactNumber.trim();
    if (!name || !number) {
      notify("Enter a contact name and phone number.");
      return;
    }
    if (editingContactIndex === null) {
      saveContacts([...contacts, { name, number }]);
    } else {
      saveContacts(
        contacts.map((contact, index) => (index === editingContactIndex ? { name, number } : contact)),
      );
      setEditingContactIndex(null);
    }
    setContactName("");
    setContactNumber("");
  };

  const sendLocationToContacts = (sharedLocation: { lat: number; lng: number } | null = location) => {
    const link = locationLink(sharedLocation);
    const message = `Emergency! I need help. My location: ${link}`;

    if (navigator.share) {
      void navigator.share({ title: "Emergency location", text: message }).catch(() => undefined);
    }
    contacts.forEach((contact) => {
      window.open(`sms:${encodeURIComponent(contact.number)}?body=${encodeURIComponent(message)}`, "_blank");
    });
    if (contacts.length === 0 && !navigator.share) notify("Add an emergency contact to send your location.");
  };

  const onFlushAlerts = async (alerts: PanicAlert[]) => {
    alerts.forEach((alert) => {
      sendLocationToContacts(alert.location);
    });
    if (alerts.length > 0) notify(`${alerts.length} offline panic alert(s) sent.`);
  };

  const { location, isFallback, isOffline, triggerPanicAlert } = useGeolocationFallback({
    onFlushAlerts,
  });

  const activeZones = useGeofencing(location, SAMPLE_ZONES, {
    onZoneEnter: (zone) => notify(`Entered ${zone.type} zone: ${zone.label}`),
    onZoneExit: (zone) => notify(`Exited ${zone.type} zone: ${zone.label}`),
  });

  const activeZoneLabel = useMemo(
    () => activeZones.map((zone) => zone.label).join(", "),
    [activeZones],
  );

  const triggerPanic = () => {
    triggerPanicAlert({ source: "panic-button" });
    sendLocationToContacts();
    window.location.href = "tel:112";
  };

  return (
    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-red-600">Panic Mode</h3>
          {isFallback ? (
            <span className="mt-1 inline-flex rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700">
              Offline — using last known location
            </span>
          ) : null}
          {isOffline && !isFallback ? <p className="mt-1 text-xs opacity-75">Offline — location will sync when online.</p> : null}
        </div>
        <button
          type="button"
          onClick={triggerPanic}
          className="animate-pulse rounded-full bg-red-600 px-6 py-3 font-extrabold text-white shadow-lg shadow-red-600/30"
        >
          PANIC — CALL 112
        </button>
      </div>

      {activeZoneLabel ? <p className="mt-3 text-xs">Active zone: {activeZoneLabel}</p> : null}
      {toast ? <p role="status" className="mt-3 rounded-lg bg-[#0B1F3A] px-3 py-2 text-sm text-white">{toast}</p> : null}

      <div className="mt-4 border-t border-red-500/20 pt-3">
        <p className="mb-2 text-sm font-semibold">Emergency contacts</p>
        <div className="flex flex-wrap gap-2">
          <input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Name" className="min-w-0 flex-1 rounded-lg border px-2 py-2 text-sm" />
          <input value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="Phone number" inputMode="tel" className="min-w-0 flex-1 rounded-lg border px-2 py-2 text-sm" />
          <button type="button" onClick={addContact} className="rounded-lg bg-[#0B1F3A] px-3 py-2 text-sm font-semibold text-white">
            {editingContactIndex === null ? "Add" : "Save"}
          </button>
        </div>
        {contacts.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs">
            {contacts.map((contact, index) => (
              <li key={`${contact.number}-${index}`} className="flex items-center justify-between rounded bg-black/5 px-2 py-1">
                <span>{contact.name} — {contact.number}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingContactIndex(index);
                      setContactName(contact.name);
                      setContactNumber(contact.number);
                    }}
                    className="font-semibold text-[#2563eb]"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => saveContacts(contacts.filter((_, contactIndex) => contactIndex !== index))} className="font-semibold text-red-600">Remove</button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
