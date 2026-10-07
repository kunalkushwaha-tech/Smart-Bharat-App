import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

type VirusTotalResult = {
  available: boolean;
  detectionRatio?: { detected: number; total: number };
  message?: string;
};

type CacheRow = {
  url: string;
  safe_browsing_result: Record<string, unknown> | null;
  virustotal_result: VirusTotalResult | null;
  scanned_at: string;
};

const CACHE_MAX_AGE_MS = 48 * 60 * 60 * 1000;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

async function readCache(client: SupabaseClient | null, url: string): Promise<CacheRow | null> {
  if (!client) return null;
  const { data, error } = await client
    .from("url_scan_cache")
    .select("url, safe_browsing_result, virustotal_result, scanned_at")
    .eq("url", url)
    .maybeSingle();
  if (error) {
    console.error("URL scan cache read failed", error);
    return null;
  }
  if (!data || Date.now() - new Date(data.scanned_at).getTime() > CACHE_MAX_AGE_MS) return null;
  return data as CacheRow;
}

async function writeCache(
  client: SupabaseClient | null,
  url: string,
  values: Partial<Pick<CacheRow, "safe_browsing_result" | "virustotal_result">>,
) {
  if (!client) return;
  const { error } = await client.from("url_scan_cache").upsert({
    url,
    ...values,
    scanned_at: new Date().toISOString(),
  });
  if (error) console.error("URL scan cache write failed", error);
}

async function scanWithVirusTotal(url: string, key: string | undefined): Promise<VirusTotalResult> {
  if (!key) return { available: false, message: "VirusTotal is not configured." };

  try {
    const scanResponse = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: { "x-apikey": key, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url }).toString(),
    });
    if (!scanResponse.ok) {
      console.error("VirusTotal scan failed", scanResponse.status);
      return { available: false, message: "VirusTotal is temporarily unavailable." };
    }

    const scanJson = (await scanResponse.json()) as { data?: { id?: string } };
    const analysisId = scanJson.data?.id;
    if (!analysisId) return { available: false, message: "VirusTotal did not return a scan result." };

    let stats: Record<string, number> | undefined;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const reportResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}`,
        { headers: { "x-apikey": key } },
      );
      if (!reportResponse.ok) {
        console.error("VirusTotal report failed", reportResponse.status);
        return { available: false, message: "VirusTotal is temporarily unavailable." };
      }
      const reportJson = (await reportResponse.json()) as {
        data?: { attributes?: { status?: string; stats?: Record<string, number> } };
      };
      stats = reportJson.data?.attributes?.stats;
      if (reportJson.data?.attributes?.status === "completed" && stats) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!stats) return { available: false, message: "VirusTotal scan is still processing. Try again shortly." };

    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    return {
      available: true,
      detectionRatio: { detected: (stats.malicious ?? 0) + (stats.suspicious ?? 0), total },
    };
  } catch (error) {
    console.error("VirusTotal request failed", error);
    return { available: false, message: "VirusTotal is temporarily unavailable." };
  }
}

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const url = typeof input.url === "string" ? input.url.trim() : "";
    const deepScan = input.deepScan === true;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (url.length > 2048 || !["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const normalizedUrl = parsedUrl.href;
    const cacheClient = getSupabase();
    const cached = await readCache(cacheClient, normalizedUrl);
    let safeBrowsing = cached?.safe_browsing_result ?? null;
    let virusTotal = cached?.virustotal_result ?? null;
    const safeBrowsingAvailable = Boolean(safeBrowsing && safeBrowsing.ok !== false);

    if (!safeBrowsing) {
      const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
      if (!key) {
        safeBrowsing = { ok: false, error: "Safe Browsing is not configured." };
      } else {
        const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "smart-bharat", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url: normalizedUrl }],
            },
          }),
        });
        if (response.ok) {
          const json = (await response.json()) as { matches?: unknown[] };
          safeBrowsing = { ok: true, matches: json.matches ?? null };
        } else {
          console.error("Safe Browsing provider failed", response.status);
          safeBrowsing = { ok: false, error: "Safe Browsing is temporarily unavailable." };
        }
      }
      await writeCache(cacheClient, normalizedUrl, { safe_browsing_result: safeBrowsing });
    }

    const safeResult = safeBrowsing as { ok?: boolean; matches?: unknown[] };
    const safe = safeResult.ok === true && (!Array.isArray(safeResult.matches) || safeResult.matches.length === 0);
    if (!virusTotal && (deepScan && safe || safeResult.ok === false)) {
      virusTotal = await scanWithVirusTotal(normalizedUrl, process.env.VIRUSTOTAL_API_KEY);
      await writeCache(cacheClient, normalizedUrl, { virustotal_result: virusTotal });
    }

    return NextResponse.json({
      ok: true,
      cached: Boolean(cached),
      safeBrowsing,
      virusTotal: virusTotal ?? { available: false, message: "Run Deep Scan to check with VirusTotal." },
      safeBrowsingAvailable,
    });
  } catch (error) {
    console.error("Safe Browsing request failed", error);
    Sentry.captureException(error, { tags: { tool: "url-scanner" } });
    return NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 });
  }
}
