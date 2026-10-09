export type UrlScanSummary = {
  parsedUrl: string;
  heuristics: string[];
  safeBrowsing: unknown;
};

function isIp(host: string) {
  return /^\d+\.\d+\.\d+\.\d+$/.test(host);
}

export function normalizeUrl(rawInput: string) {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error("Enter a URL");
  }

  try {
    return new URL(trimmed);
  } catch {
    return new URL(`https://${trimmed}`);
  }
}

export function computeUrlHeuristics(url: URL) {
  const host = url.hostname;
  const heuristics: string[] = [];
  if (isIp(host)) heuristics.push("URL uses raw IP address (suspicious)");
  if (host.split(".").length > 4) heuristics.push("Many subdomains — possible obfuscation");
  if (host.includes("-")) heuristics.push("Hyphen in domain — sometimes used by phishing domains");
  if (host.startsWith("xn--")) heuristics.push("Punycode domain (lookalike risk)");
  if (host.length > 64) heuristics.push("Very long hostname");
  return heuristics;
}

export async function runUrlSafetyScan(rawInput: string): Promise<UrlScanSummary> {
  let parsed: URL;
  try {
    parsed = normalizeUrl(rawInput);
  } catch {
    throw new Error("Invalid URL");
  }

  const heuristics = computeUrlHeuristics(parsed);
  const response = await fetch("/api/safe-browsing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: parsed.href }),
  });
  const safeBrowsing = (await response.json()) as unknown;

  return {
    parsedUrl: parsed.href,
    heuristics,
    safeBrowsing,
  };
}
