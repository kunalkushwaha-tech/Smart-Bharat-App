"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function clean(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 2000);
}

function SharedContent() {
  const params = useSearchParams();
  const [online, setOnline] = useState(true);
  const title = clean(params.get("title") ?? "");
  const text = clean(params.get("text") ?? "");
  const url = clean(params.get("url") ?? "");
  const shared = useMemo(() => [title, text, url].filter(Boolean).join("\n"), [title, text, url]);
  const detectedUrl = useMemo(() => shared.match(/https?:\/\/[^\s]+/i)?.[0] ?? "", [shared]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F7FC] px-5 py-8 text-[#111E30]">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-semibold underline">← Back to Bharat App</Link>
        <h1 className="mt-6 text-3xl font-extrabold">Shared with Bharat App</h1>
        <p className="mt-2">Check this?</p>
        <div className="mt-5 rounded-xl border bg-white p-4">
          <span className="rounded-full bg-[#0B1F3A] px-3 py-1 text-xs font-bold text-white">Shared content</span>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-sm">{shared || "No text was shared."}</pre>
        </div>
        <p className="mt-4 text-sm">{online ? "Choose a tool below. Nothing is scanned automatically." : "You are offline. Scanning is unavailable until you reconnect."}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {detectedUrl ? <Link href={`/security-tools?url=${encodeURIComponent(detectedUrl)}`} className="inline-flex min-h-11 items-center rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">Open URL Scanner</Link> : <Link href={`/security-tools?message=${encodeURIComponent(shared)}`} className="inline-flex min-h-11 items-center rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">Open Message Analyzer</Link>}
        </div>
        <section className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="font-bold">Red-flag checklist</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Urgent deadlines or threats</li><li>Requests for OTP, PIN, passwords, or advance fees</li><li>Look-alike domains and shortened links</li><li>Verify through an official app or website you open yourself</li>
          </ul>
        </section>
        <p className="mt-6 text-sm text-gray-600">Install hint: on Android Chrome, use the browser menu and choose “Add to Home screen” or “Install app” to use sharing from the installed app.</p>
      </div>
    </main>
  );
}

export default function SharePage() {
  return <Suspense fallback={<main className="p-8">Loading shared content…</main>}><SharedContent /></Suspense>;
}
