"use client";

import Link from "next/link";
import { useState } from "react";
import VisitorCounter from "../components/VisitorCounter";

export default function TermsPage() {
  const [isDark, setIsDark] = useState(true);
  const panel = isDark ? "border-white/10 bg-[#0A1424]" : "border-[#0B1F3A]/10 bg-white";
  return (
    <div className={`min-h-screen ${isDark ? "bg-[#050B14] text-[#ECF2FA]" : "bg-[#F4F7FC] text-[#111E30]"}`}>
      <div className="h-[6px] w-full bg-[linear-gradient(90deg,#FF9933_0%,#FF9933_33%,#fff_33%,#fff_66%,#128807_66%)]" />
      <header className={`sticky top-0 z-50 border-b px-5 py-4 shadow-sm md:px-8 ${panel}`}>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xl font-extrabold tracking-wide text-[#FF9933]">Bharat App</Link>
          <p className="hidden text-xs text-gray-400 md:block">One Platform for Cyber Safety & Citizen Services</p>
          <VisitorCounter />
          <button type="button" onClick={() => setIsDark((dark) => !dark)} className="rounded-full bg-[#122A4D] px-4 py-2 text-sm font-semibold"> {isDark ? "☀ Light" : "🌙 Dark"} </button>
          <Link href="/" className="rounded-full bg-[#122A4D] px-4 py-2 text-sm font-semibold">Back to Home</Link>
        </div>
      </header>
      <nav className={`sticky top-[73px] z-40 border-b px-5 py-3 md:px-8 ${panel}`}>
        <div className="mx-auto flex w-full max-w-6xl gap-3 overflow-x-auto pb-1">
          {[
            ["#emergency", "Emergency Services", "fa-heart-pulse"],
            ["#ai", "AI Companion & Schemes", "fa-robot"],
            ["#complaints", "Complaints & Grievances", "fa-file-invoice"],
            ["#security", "Security Tools & Audit", "fa-screwdriver-wrench"],
            ["#academy", "Cyber Awareness Academy", "fa-graduation-cap"],
          ].map(([href, label, icon]) => (
            <Link key={href} href={`/${href}`} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[#0A1424] px-4 py-2 text-sm font-bold">
              <i className={`fa-solid ${icon}`} /> {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <Link href="/" className="text-sm font-semibold text-[#FF9933] underline">&larr; Back to Home</Link>
        <section className={`mt-4 rounded-2xl border p-6 ${panel}`}>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <div className="mt-8 space-y-6 opacity-90">
            <div><h2 className="text-xl font-semibold">Acceptable use</h2><p className="mt-2">Use Bharat App lawfully and respectfully. Do not misuse its tools, submit harmful content, attempt unauthorized access, or rely on it to impersonate an official authority.</p></div>
            <div><h2 className="text-xl font-semibold">Informational guidance only</h2><p className="mt-2">The app provides general informational guidance and tools. It is not legal, medical, financial, or professional advice; verify important decisions with qualified professionals and official sources.</p></div>
            <div><h2 className="text-xl font-semibold">AI limitations</h2><p className="mt-2">AI-generated responses can be incomplete or inaccurate. Review outputs carefully and do not submit passwords, OTPs, financial credentials, or other sensitive information.</p></div>
            <div><h2 className="text-xl font-semibold">Emergency features</h2><p className="mt-2">PanicMode and emergency resources are supplementary aids only. They are not a replacement for calling official emergency services directly, including 112, or contacting the appropriate authority.</p></div>
            <div><h2 className="text-xl font-semibold">External services</h2><p className="mt-2">Links and data from external services are subject to their own availability and terms. Bharat App does not guarantee their accuracy or uptime.</p></div>
          </div>
        </section>
      </main>
      <footer className="mt-16 border-t border-gray-700 py-8 text-center text-gray-400">
        <div className="mb-3 flex justify-center gap-6"><Link href="/" className="hover:text-white">About</Link><Link href="/privacy" className="hover:text-white">Privacy Policy</Link><Link href="/terms" className="hover:text-white">Terms of Service</Link><a href="mailto:support@bharatapp.example" className="hover:text-white">Contact</a></div>
        <p className="text-sm">© 2026 Bharat App</p>
      </footer>
    </div>
  );
}
