"use client";

import Link from "next/link";

const storageKeys = [
  "theme",
  "panicmode:last-known-location",
  "panicmode:offline-alert-queue",
  "panicmode:emergency-contacts",
];

export default function PrivacyPage() {
  const clearStoredData = () => {
    storageKeys.forEach((key) => window.localStorage.removeItem(key));
    window.alert("Stored Bharat App data has been cleared from this browser.");
  };

  return (
    <main className="min-h-screen bg-[#F4F7FC] px-5 py-8 text-[#111E30] md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-semibold text-[#2563eb] underline">← Back to Bharat App</Link>
        <h1 className="mt-6 text-4xl font-extrabold">Privacy &amp; Safety</h1>
        <p className="mt-2 text-sm opacity-75">A plain-language overview of how Bharat App handles information.</p>
        <div className="mt-8 space-y-5">
          <section className="rounded-xl border border-[#0B1F3A]/10 bg-white p-5">
            <h2 className="text-xl font-bold">What data we collect</h2>
            <p className="mt-2 text-sm">The app may use your approximate/current location when you grant browser permission, plus information you enter into tools such as complaints and emergency contacts.</p>
          </section>
          <section className="rounded-xl border border-[#0B1F3A]/10 bg-white p-5">
            <h2 className="text-xl font-bold">How location is used</h2>
            <p className="mt-2 text-sm">Location is used to show nearby emergency services, calculate geofences, create map links, and support panic alerts. It is not collected until you grant permission.</p>
          </section>
          <section className="rounded-xl border border-[#0B1F3A]/10 bg-white p-5">
            <h2 className="text-xl font-bold">Data storage practices</h2>
            <p className="mt-2 text-sm">Preferences, emergency contacts, the last known location, and offline alert queues are stored locally in your browser&apos;s localStorage. The app does not provide a server account or central profile.</p>
          </section>
          <section className="rounded-xl border border-[#0B1F3A]/10 bg-white p-5">
            <h2 className="text-xl font-bold">Which APIs are used</h2>
            <p className="mt-2 text-sm">Depending on the tool, the app may use OpenStreetMap/Overpass for nearby services, Google Safe Browsing for URL checks, Have I Been Pwned (HIBP) for breach checks, and browser Web Share, SMS, and geolocation APIs.</p>
          </section>
          <section className="rounded-xl border border-[#0B1F3A]/10 bg-white p-5">
            <h2 className="text-xl font-bold">Delete or clear stored data</h2>
            <p className="mt-2 text-sm">Use the button below to remove Bharat App&apos;s local browser data. You can also revoke location permission in your browser settings.</p>
            <button type="button" onClick={clearStoredData} className="mt-4 rounded-full bg-[#d93838] px-4 py-2 text-sm font-semibold text-white">Clear stored data</button>
          </section>
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
            <h2 className="text-xl font-bold">Disclaimer</h2>
            <p className="mt-2 text-sm">AI guidance and automated checks may not always be accurate. For emergencies, contact the appropriate official service directly, including 112.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
