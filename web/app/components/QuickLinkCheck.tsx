"use client";

import { useState } from "react";
import Link from "next/link";
import { useUrlSafetyScan } from "../security-tools/components/useUrlSafetyScan";

function extractFirstUrl(value: string): string | null {
  return value.match(/\bhttps?:\/\/[^\s<>"']+/i)?.[0] ?? value.match(/\b(?:www\.)?[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s<>"']*)?/i)?.[0] ?? null;
}

export default function QuickLinkCheck() {
  const [input, setInput] = useState("");
  const { result, loading, error, scan } = useUrlSafetyScan();
  const verdict = result
    ? result.heuristics.length > 0 || (result.safeBrowsing as { matches?: unknown[] } | null)?.matches?.length
      ? { label: "Needs caution", advice: "Do not open it. Verify the sender and use the official app or website." }
      : { label: "No immediate flags", advice: "Still verify the domain and context before signing in or paying." }
    : null;

  async function checkLink() {
    const url = extractFirstUrl(input);
    if (url) await scan(url);
  }

  return (
    <div className="mt-3 rounded-xl border border-[#FF9933]/30 bg-[#FF9933]/5 p-3">
      <h3 className="mb-2 text-sm font-semibold">Check a link</h3>
      <label htmlFor="quick-link-check" className="sr-only">Check a link input</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="quick-link-check" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste text or a URL" className="min-h-11 min-w-0 flex-1 rounded-lg border px-3 py-2" />
        <button type="button" onClick={() => void checkLink()} disabled={loading} className="min-h-11 rounded-full bg-[#FF9933] px-4 py-2 font-semibold text-white">{loading ? "Checking..." : "Check link"}</button>
      </div>
      {error ? <p role="alert" className="mt-2 text-sm text-[#b42318]">{error}</p> : null}
      {verdict ? <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="rounded-full border border-current px-3 py-1 font-bold">{verdict.label}</span><span>{verdict.advice}</span><Link href={`/security-tools?url=${encodeURIComponent(result?.parsedUrl ?? "")}`} className="font-semibold text-[#007c91] underline">Open full scanner</Link></div> : null}
      <p className="mt-2 text-xs opacity-70">The link is sent only to Bharat App&apos;s scanner APIs; it is never opened or fetched by your browser.</p>
    </div>
  );
}
