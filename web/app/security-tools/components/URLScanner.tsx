'use client';

import { useState } from 'react';
import { runUrlSafetyScan, type UrlScanSummary } from './urlSafety';
import { updateCyberHygieneResults } from './cyberHygieneStorage';
import ToolFeedback from './ToolFeedback';
import RecentChecks from './RecentChecks';
import { addToolHistory } from './toolActivity';
import PrivacyTrustBadge from '../../components/PrivacyTrustBadge';

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<UrlScanSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upi, setUpi] = useState('');
  const [upiResult, setUpiResult] = useState<string | null>(null);
  const [deepScanning, setDeepScanning] = useState(false);

  async function scan(requestDeepScan = false) {
    setError(null);
    setResult(null);
    const u = url.trim();
    if (!u) {
      setError('Enter a URL');
      return;
    }

    setLoading(true);
    try {
      const summary = await runUrlSafetyScan(u, requestDeepScan);
      setResult(summary);
      const safeBrowsing = summary.safeBrowsing as { matches?: unknown[] } | null;
      updateCyberHygieneResults({
        url: {
          flags: summary.heuristics.length,
          threatFound: Array.isArray(safeBrowsing?.matches) && safeBrowsing.matches.length > 0,
          checked: true,
        },
      });
      addToolHistory('url', { summary: summary.heuristics.length ? `${summary.heuristics.length} heuristic flag(s)` : 'No heuristic flags', detail: summary.parsedUrl });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
      setDeepScanning(false);
    }
  }

  function deepScan() {
    setDeepScanning(true);
    void scan(true);
  }

  function verifyUPI() {
    const normalized = upi.trim().toLowerCase();
    const valid = /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/.test(normalized);
    const flagged = ['fraud@ybl', 'scam@oksbi', 'test@fraud'].includes(normalized);
    setUpiResult(
      !valid
        ? 'UPI ID format looks invalid.'
        : flagged
          ? 'Mock fraud database match: do not pay this ID.'
          : 'Format looks valid. No match in the local demo fraud list.',
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0A1424] p-4 shadow">
      <label className="mb-2 block font-medium text-[#ECF2FA]">URL to scan</label>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <button className="rounded bg-sky-600 px-4 py-2 text-white" onClick={() => void scan()} disabled={loading}>
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      {error && <div className="mt-3 text-red-300">{error}</div>}

      {result && (
        <div className="mt-4 space-y-2 text-[#ECF2FA]">
          <div>
            <strong>Resolved URL:</strong> <code className="break-words">{result.parsedUrl}</code>
          </div>
          <div>
            <strong>Local heuristics:</strong>
            {result.heuristics.length > 0 ? (
              <ul className="list-disc ml-6">
                {result.heuristics.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            ) : (
              <span className="ml-2 text-green-700">No immediate heuristic flags</span>
            )}
          </div>

          <div>
            <strong>Google Safe Browsing:</strong>
            <pre className="max-h-64 overflow-auto rounded bg-[#050B14] p-2 text-sm">
              {JSON.stringify(result.safeBrowsing, null, 2)}
            </pre>
          </div>
          <div>
            <strong>VirusTotal:</strong>{' '}
            {result.virusTotal.available && result.virusTotal.detectionRatio ? (
              <span>
                {result.virusTotal.detectionRatio.detected}/
                {result.virusTotal.detectionRatio.total} security vendors flagged this URL
              </span>
            ) : (
              <span className="text-[#C8D5EA]">
                {result.virusTotal.message ?? 'VirusTotal check is unavailable.'}
              </span>
            )}
          </div>
          {!deepScanning && !result.virusTotal.available && (
            <button
              type="button"
              className="rounded bg-indigo-600 px-3 py-2 text-sm text-white"
              onClick={deepScan}
              disabled={loading}
            >
              Deep Scan with VirusTotal
            </button>
          )}
        </div>
      )}

      <div className="mt-3 text-sm text-[#C8D5EA]">
        Note: Safe Browsing always runs first. VirusTotal runs only for a Deep Scan or when Safe
        Browsing is unavailable. Results are cached for 48 hours.
      </div>
      <div className="mt-6 border-t border-white/10 pt-4">
        <label className="mb-2 block font-medium text-[#ECF2FA]" htmlFor="upi-verifier">UPI ID verifier</label>
        <div className="flex gap-2">
          <input
            id="upi-verifier"
            className="flex-1 rounded border border-white/15 bg-[#050B14] p-2 text-[#ECF2FA]"
            value={upi}
            onChange={(event) => setUpi(event.target.value)}
            placeholder="user@ybl"
          />
          <button type="button" className="rounded bg-sky-600 px-4 py-2 text-white" onClick={verifyUPI}>Verify</button>
        </div>
        {upiResult && <p className="mt-3 rounded bg-[#050B14] p-3 text-sm text-[#C8D5EA]">{upiResult}</p>}
        <p className="mt-2 text-xs text-[#C8D5EA]">Demo check only. Confirm the recipient name in your UPI app before paying.</p>
      </div>
      <ToolFeedback toolId="url" />
      <RecentChecks toolId="url" />
      <div className="mt-4">
        <PrivacyTrustBadge />
      </div>
    </div>
  );
}