"use client";

import { useState } from "react";
import { runUrlSafetyScan, type UrlScanSummary } from "./urlSafety";

export function useUrlSafetyScan() {
  const [result, setResult] = useState<UrlScanSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan(rawInput: string, deepScan = false) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const nextResult = await runUrlSafetyScan(rawInput, deepScan);
      setResult(nextResult);
      return nextResult;
    } catch (scanError: unknown) {
      setError(scanError instanceof Error ? scanError.message : "URL scan failed");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, scan, setResult, setError };
}
