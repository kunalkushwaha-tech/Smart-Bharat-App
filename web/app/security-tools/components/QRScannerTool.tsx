'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { runUrlSafetyScan, type UrlScanSummary } from './urlSafety';

export default function QRScannerTool() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanText, setScanText] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<UrlScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  async function startScan() {
    if (!videoRef.current) {
      setError('Camera preview not ready.');
      return;
    }
    setError(null);
    setScanResult(null);

    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        const scannedText = result.data.trim();
        setScanText(scannedText);
        setLoading(true);
        try {
          const urlSummary = await runUrlSafetyScan(scannedText);
          setScanResult(urlSummary);
          setError(null);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(`QR scanned, but URL scan failed: ${message}`);
        } finally {
          setLoading(false);
        }
      },
      { returnDetailedScanResult: true, highlightScanRegion: true, highlightCodeOutline: true },
    );

    scannerRef.current = scanner;
    try {
      await scanner.start();
      setIsScanning(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Camera access failed: ${message}`);
      setIsScanning(false);
      scanner.destroy();
      scannerRef.current = null;
    }
  }

  function stopScan() {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0A1424] p-4 shadow">
      <p className="mb-3 text-sm text-[#ECF2FA]">
        Scan a QR code and automatically run URL safety checks.
      </p>
      <video ref={videoRef} className="h-[260px] w-full rounded border border-white/15 bg-black" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            void startScan();
          }}
          className="rounded-full bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white"
          disabled={isScanning}
        >
          Start Camera Scan
        </button>
        <button
          type="button"
          onClick={stopScan}
          className="rounded-full bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white"
        >
          Stop
        </button>
      </div>

      {scanText ? <p className="mt-3 text-sm text-[#ECF2FA]">Scanned: {scanText}</p> : null}
      {loading ? <p className="mt-2 text-sm text-[#C8D5EA]">Scanning URL safety...</p> : null}
      {error ? <p className="mt-2 text-sm text-[#ffb0b0]">{error}</p> : null}

      {scanResult ? (
        <div className="mt-3 rounded-lg border border-white/15 bg-[#122A4D] p-3 text-sm text-[#ECF2FA]">
          <p>
            <strong>Resolved URL:</strong> {scanResult.parsedUrl}
          </p>
          <p className="mt-2">
            <strong>Heuristic Verdict:</strong>{' '}
            {scanResult.heuristics.length > 0 ? 'Potentially Unsafe' : 'Looks Safe'}
          </p>
          {scanResult.heuristics.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {scanResult.heuristics.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2">
            <strong>Safe Browsing Response:</strong>
          </p>
          <pre className="mt-1 max-h-48 overflow-auto rounded bg-[#050B14] p-2 text-xs">
            {JSON.stringify(scanResult.safeBrowsing, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
