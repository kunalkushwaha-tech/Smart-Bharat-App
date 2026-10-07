"use client";

import Link from "next/link";
import { useState } from "react";
import VisitorCounter from "../components/VisitorCounter";

const tabs = [
  ["#emergency", "Emergency Services", "fa-heart-pulse"],
  ["#ai", "AI Companion & Schemes", "fa-robot"],
  ["#complaints", "Complaints & Grievances", "fa-file-invoice"],
  ["#security", "Security Tools & Audit", "fa-screwdriver-wrench"],
  ["#academy", "Cyber Awareness Academy", "fa-graduation-cap"],
];

export default function PrivacyPage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? "bg-[#050B14] text-[#ECF2FA]" : "bg-[#F4F7FC] text-[#111E30]"
      }`}
    >
      <div className="h-[6px] w-full bg-[linear-gradient(90deg,#FF9933_0%,#FF9933_33%,#fff_33%,#fff_66%,#128807_66%)]" />

      <header
        className={`sticky top-0 z-50 border-b px-5 py-4 shadow-sm md:px-8 ${
          isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xl font-extrabold tracking-wide text-[#FF9933]">Bharat App</Link>
          <p className="hidden text-xs text-gray-400 md:block">One Platform for Cyber Safety & Citizen Services</p>
          <VisitorCounter />
          <button
            type="button"
            onClick={() => setIsDark((dark) => !dark)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isDark ? "bg-[#122A4D] text-[#ECF2FA]" : "bg-[#0B1F3A] text-white"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀ Light" : "🌙 Dark"}
          </button>
          <Link href="/" className="rounded-full bg-[#122A4D] px-4 py-2 text-sm font-semibold">
            Back to Home
          </Link>
        </div>
      </header>

      <nav
        className={`sticky top-[73px] z-40 border-b px-5 py-3 md:px-8 ${
          isDark ? "border-white/10 bg-[#0A1424]/95" : "border-[#0B1F3A]/10 bg-white/95"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl gap-3 overflow-x-auto pb-1">
          {tabs.map(([href, label, icon]) => (
            <Link
              key={href}
              href={`/${href}`}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                isDark
                  ? "border-white/15 bg-[#0A1424] text-[#ECF2FA] hover:bg-[#122A4D]"
                  : "border-[#0B1F3A]/15 bg-white text-[#5C6E88] hover:bg-[#f7f9fd]"
              }`}
            >
              <i className={`fa-solid ${icon}`} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <Link href="/" className="text-sm font-semibold text-[#FF9933] underline">
          &larr; Back to Home
        </Link>
        <section
          className={`mt-4 rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white"
          }`}
        >
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-[#ECF2FA]/80">
            Bharat App is designed to help citizens access public services and safety resources.
            We respect your privacy and aim to collect only the information needed to provide
            these features.
          </p>

          <div className="mt-8 space-y-6 text-[#ECF2FA]/80">
            <div>
              <h2 className="text-xl font-semibold text-white">Information we use</h2>
              <p className="mt-2">
                Information you enter into tools such as the complaint formatter, scheme finder,
                and AI companion is used to provide the requested result. Do not submit passwords,
                OTPs, financial credentials, or other sensitive personal information.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Location usage</h2>
              <p className="mt-2">
                Location is used only to power Nearby Services and PanicMode features. Your
                location is not stored on any server.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Data storage</h2>
              <p className="mt-2">
                Emergency contacts and your last-known location are stored locally in your
                browser using localStorage, not on a server.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">APIs used</h2>
              <p className="mt-2">
                The app may use a breach check API, a safe browsing/URL check API, and
                OpenStreetMap/Overpass APIs to find nearby places.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">External services</h2>
              <p className="mt-2">
                Links to official government and emergency services open those external websites
                or phone services. Their privacy practices are governed by their own policies.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">How to delete or clear data</h2>
              <p className="mt-2">
                Clear this app&apos;s site data or localStorage through your browser&apos;s privacy
                or site settings. This removes locally stored emergency contacts and location data.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Disclaimer</h2>
              <p className="mt-2">
                ⚠️ AI-generated guidance may not always be accurate. Verify important information
                from official sources.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p className="mt-2">
                If you have questions about this policy, use the Contact link on the Bharat App
                home page.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-gray-700 py-8 text-center text-gray-400">
        <div className="mb-3 flex justify-center gap-6">
          <Link href="/" className="hover:text-white">About</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <a href="https://github.com/kunalkushwaha-tech" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            GitHub
          </a>
          <a href="tel:+918126748461" className="hover:text-white">Contact</a>
        </div>
        <p className="text-sm">© 2026 Bharat App</p>
      </footer>
    </div>
  );
}
