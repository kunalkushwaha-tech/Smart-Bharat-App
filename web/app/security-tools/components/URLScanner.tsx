'use client';

import { useState } from 'react';
import { runUrlSafetyScan, type UrlScanSummary } from './urlSafety';

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<UrlScanSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setError(null);
    setResult(null);
    const u = url.trim();
    if (!u) {
      setError('Enter a URL');
      return;
    }

    setLoading(true);
    try {
      const summary = await runUrlSafetyScan(u);
      setResult(summary);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
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
        <button className="rounded bg-sky-600 px-4 py-2 text-white" onClick={scan} disabled={loading}>
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
        </div>
      )}

      <div className="mt-3 text-sm text-[#C8D5EA]">
        Note: Safe Browsing requires a server-side API key. If no key is configured, the server will return an explanatory message and heuristics above still apply.
      </div>
    </div>
  );
}