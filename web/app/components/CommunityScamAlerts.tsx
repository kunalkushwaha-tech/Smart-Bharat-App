"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ScamReport = {
  id: string;
  created_at: string;
  scam_type: string;
  contact_info: string;
  description: string | null;
  reported_count?: number;
};

const scamTypes = ["UPI", "Phishing", "Fake Job", "Investment", "OTP", "Other"];
const rateLimitKey = "smart-bharat-scam-report-last-submitted";

function isConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function defang(value: string) {
  return value.replace(/^https?:\/\//i, (scheme) => scheme.replace("://", "[://")).replace(/\./g, "[.]");
}

export default function CommunityScamAlerts() {
  const configured = useMemo(() => isConfigured(), []);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [contactInfo, setContactInfo] = useState("");
  const [scamType, setScamType] = useState(scamTypes[0]);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const backoffRef = useRef(45_000);

  const loadReports = useCallback(async () => {
    if (!configured || !mountedRef.current || document.visibilityState !== "visible") return false;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("/api/scam-reports", { signal: controller.signal });
      if (!response.ok) {
        let detail = "server";
        try {
          const body = await response.json() as { error?: string };
          if (body.error === "not configured") detail = "not configured";
          else if (body.error === "unreachable") detail = "unreachable";
        } catch { /* use generic state */ }
        if (mountedRef.current) setReportError(detail);
        return false;
      }
      const data = await response.json() as { reports?: ScamReport[] };
      if (!Array.isArray(data.reports)) throw new Error("invalid response");
      if (mountedRef.current) {
        setReports(data.reports);
        setLastUpdated(new Date().toISOString());
        setReportError(null);
      }
      backoffRef.current = 45_000;
      return true;
    } catch (error: unknown) {
      if (mountedRef.current && !(error instanceof DOMException && error.name === "AbortError")) setReportError("network");
      return false;
    } finally {
      window.clearTimeout(timeoutId);
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [configured]);

  useEffect(() => {
    mountedRef.current = true;
    let timer: number | undefined;
    const schedule = (delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        const ok = await loadReports();
        backoffRef.current = ok ? 45_000 : Math.min(backoffRef.current * 2, 10 * 60_000);
        if (document.visibilityState === "visible") schedule(backoffRef.current);
      }, delay);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        backoffRef.current = 45_000;
        schedule(0);
      } else {
        window.clearTimeout(timer);
        requestRef.current?.abort();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    schedule(0);
    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
      requestRef.current?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadReports, retryCount]);

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
    try {
      const response = await fetch("/api/scam-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scam_type: scamType, contact_info: contactInfo.trim(), description: description.trim() || null }),
      });
      const data = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setMessage(data?.error || "We could not submit that report. Please try again.");
        return;
      }
      localStorage.setItem(rateLimitKey, String(Date.now()));
      setContactInfo("");
      setDescription("");
      setMessage("Thanks. Your anonymous report was shared with the community.");
      setRetryCount((value) => value + 1);
    } catch {
      setMessage("We could not submit that report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reportAbuse(id: string) {
    try {
      const response = await fetch("/api/scam-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abuse_report_id: id }),
      });
      if (response.ok) {
        setMessage("Thanks. The report was flagged for review.");
        setReports((items) => items.filter((item) => item.id !== id));
      } else {
        setMessage("We could not flag that report right now.");
      }
    } catch {
      setMessage("We could not flag that report right now.");
    }
  }

  if (!configured) {
    return <section className="mt-6 rounded-xl border border-white/10 bg-[#122A4D] p-4 text-[#ECF2FA]"><h3 className="text-xl font-bold">Community Scam Alerts</h3><p className="mt-2 text-sm opacity-80">This feature is not configured yet. Add the Supabase values from <code>.env.local.example</code> to enable shared scam reports.</p></section>;
  }

  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-[#122A4D] p-4 text-[#ECF2FA]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-xl font-bold">Community Scam Alerts</h3><p className="mt-1 text-sm opacity-80">Community reports are not verified by Bharat App.</p></div>
        <button type="button" onClick={() => setRetryCount((value) => value + 1)} className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold">Refresh</button>
      </div>
      {lastUpdated ? <p className="mt-2 text-xs opacity-70">Last updated: {formatDate(lastUpdated)}</p> : null}
      {reportError ? <div className="mt-3 rounded-lg border border-red-300/30 bg-red-950/30 p-3 text-sm"><p>Scam alerts abhi load nahi ho paa rahe. Thodi der baad try karein.</p><button type="button" onClick={() => setRetryCount((value) => value + 1)} className="mt-2 min-h-11 rounded-full bg-[#FF9933] px-4 py-2 font-semibold">Retry</button></div> : null}
      {reports.length ? <div className="mt-4 space-y-3">{reports.map((report) => <article key={report.id} className="rounded-lg border border-white/10 bg-[#0A1424] p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{report.scam_type}</p><p className="text-sm">{/https?:\/\//i.test(report.contact_info) ? defang(report.contact_info) : report.contact_info}</p></div><button type="button" onClick={() => void reportAbuse(report.id)} className="min-h-11 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold">Report abuse</button></div><p className="mt-2 text-xs opacity-75">Community report, not verified by Bharat App · Reported {report.reported_count ?? 1} times · {formatDate(report.created_at)}</p>{report.description ? <p className="mt-2 text-sm">{report.description}</p> : null}</article>)}</div> : !reportError ? <p className="mt-4 text-sm opacity-80">No reports yet.</p> : null}
      <form onSubmit={submitReport} className="mt-5 grid gap-3 border-t border-white/10 pt-4">
        <input value={contactInfo} onChange={(event) => setContactInfo(event.target.value)} placeholder="Phone number or suspicious link" className="rounded border border-white/15 bg-[#050B14] p-2" />
        <label htmlFor="community-scam-type" className="sr-only">Scam type</label>
        <select id="community-scam-type" value={scamType} onChange={(event) => setScamType(event.target.value)} className="rounded border border-white/15 bg-[#050B14] p-2">{scamTypes.map((type) => <option key={type}>{type}</option>)}</select>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} placeholder="Short description (optional)" className="rounded border border-white/15 bg-[#050B14] p-2" />
        <button type="submit" disabled={submitting} className="min-h-11 w-fit rounded-full bg-[#8f4700] px-4 py-2 text-sm font-semibold">{submitting ? "Submitting..." : "Report a Scam"}</button>
        {message ? <p className="text-sm" aria-live="polite">{message}</p> : null}
      </form>
    </section>
  );
}
