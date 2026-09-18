"use client";

import { useEffect, useMemo, useState } from "react";

type ScamReport = {
  id: string;
  created_at: string;
  scam_type: string;
  contact_info: string;
  description: string | null;
};

const scamTypes = ["UPI", "Phishing", "Fake Job", "Investment", "OTP", "Other"];
const rateLimitKey = "smart-bharat-scam-report-last-submitted";

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

function maskContact(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 7 && digits.length === trimmed.replace(/[^\d+\- ()]/g, "").length) {
    return `••••${digits.slice(-4)}`;
  }
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return `${url.hostname}/••••`;
  } catch {
    return `${trimmed.slice(0, 3)}••••`;
  }
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function CommunityScamAlerts() {
  const configured = useMemo(isConfigured, []);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [contactInfo, setContactInfo] = useState("");
  const [scamType, setScamType] = useState(scamTypes[0]);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadReports() {
    if (!configured) return;
    const response = await fetch("/api/scam-reports");
    if (!response.ok) {
      setMessage("Reports are temporarily unavailable. Please try again later.");
      return;
    }
    const data = (await response.json()) as { reports?: ScamReport[] };
    setReports(data.reports ?? []);
  }

  useEffect(() => {
    void loadReports();
  }, [configured]);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    const lastSubmitted = Number(localStorage.getItem(rateLimitKey) || 0);
    if (Date.now() - lastSubmitted < 60_000) {
      setMessage("Please wait 60 seconds between reports.");
      return;
    }
    if (!contactInfo.trim()) {
      setMessage("Enter the phone number or link being reported.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    const response = await fetch("/api/scam-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scam_type: scamType, contact_info: contactInfo.trim(), description: description.trim() || null }),
    });
    setSubmitting(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.status === 429) {
        setMessage(data?.error || "Please wait before submitting another report.");
      } else {
        setMessage(data?.error || "We could not submit that report. Please try again.");
      }
      return;
    }
    localStorage.setItem(rateLimitKey, String(Date.now()));
    setContactInfo("");
    setDescription("");
    setMessage("Thanks. Your anonymous report was shared with the community.");
    await loadReports();
  }

  if (!configured) {
    return (
      <section className="mt-6 rounded-xl border border-white/10 bg-[#122A4D] p-4">
        <h3 className="text-xl font-bold">Community Scam Alerts</h3>
        <p className="mt-2 text-sm opacity-80">This feature is not configured yet. Add the Supabase values from <code>.env.local.example</code> to enable shared scam reports.</p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-[#122A4D] p-4">
      <h3 className="text-xl font-bold">Community Scam Alerts</h3>
      <p className="mt-1 text-sm opacity-80">Share anonymous warnings and check recent reports from the community.</p>
      <form onSubmit={submitReport} className="mt-4 grid gap-3">
        <input value={contactInfo} onChange={(event) => setContactInfo(event.target.value)} placeholder="Phone number or suspicious link" className="rounded border border-white/15 bg-[#050B14] p-2" />
        <select value={scamType} onChange={(event) => setScamType(event.target.value)} className="rounded border border-white/15 bg-[#050B14] p-2">
          {scamTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} placeholder="Short description (optional)" className="rounded border border-white/15 bg-[#050B14] p-2" />
        <button type="submit" disabled={submitting} className="w-fit rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold">{submitting ? "Submitting..." : "Report a Scam"}</button>
      </form>
      {message && <p className="mt-3 text-sm text-[#C8D5EA]">{message}</p>}
      <div className="mt-5 border-t border-white/10 pt-4">
        <h4 className="font-semibold">Recent Scam Reports</h4>
        {reports.length === 0 ? <p className="mt-2 text-sm opacity-75">No reports yet.</p> : (
          <ul className="mt-2 space-y-2">
            {reports.map((report) => (
              <li key={report.id} className="rounded-lg bg-[#0A1424] p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-900/60 px-2 py-1 text-xs font-semibold text-red-100">{report.scam_type}</span>
                  <span className="font-semibold">{maskContact(report.contact_info)}</span>
                  <time className="text-xs opacity-60" dateTime={report.created_at}>{relativeTime(report.created_at)}</time>
                </div>
                {report.description && <p className="mt-2 text-xs opacity-80">{report.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
