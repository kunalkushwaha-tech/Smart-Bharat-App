import { NextResponse } from 'next/server';

type VirusTotalResult = {
  available: boolean;
  detectionRatio?: {
    detected: number;
    total: number;
  };
  message?: string;
};

async function scanWithVirusTotal(url: string, key: string | undefined): Promise<VirusTotalResult> {
  if (!key) {
    return { available: false, message: 'VirusTotal check is unavailable (API key not configured).' };
  }

  try {
    const scanResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': key,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url }).toString(),
    });

    if (!scanResponse.ok) {
      console.error('VirusTotal scan failed', scanResponse.status);
      return { available: false, message: 'VirusTotal check is temporarily unavailable.' };
    }

    const scanJson = (await scanResponse.json()) as { data?: { id?: string } };
    const analysisId = scanJson.data?.id;
    if (!analysisId) {
      return { available: false, message: 'VirusTotal did not return a scan result.' };
    }

    let stats: Record<string, number> | undefined;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const reportResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}`,
        { headers: { 'x-apikey': key } },
      );
      if (!reportResponse.ok) {
        console.error('VirusTotal report failed', reportResponse.status);
        return { available: false, message: 'VirusTotal check is temporarily unavailable.' };
      }

      const reportJson = (await reportResponse.json()) as {
        data?: { attributes?: { status?: string; stats?: Record<string, number> } };
      };
      stats = reportJson.data?.attributes?.stats;
      if (reportJson.data?.attributes?.status === 'completed' && stats) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!stats) {
      return { available: false, message: 'VirusTotal scan is still processing. Try again shortly.' };
    }

    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const detected = (stats.malicious ?? 0) + (stats.suspicious ?? 0);
    return { available: true, detectionRatio: { detected, total } };
  } catch (error) {
    console.error('VirusTotal request failed', error);
    return { available: false, message: 'VirusTotal check is temporarily unavailable.' };
  }
}

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const url = typeof input.url === "string" ? input.url.trim() : "";
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (url.length > 2048 || !["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Safe Browsing is not configured' }, { status: 503 });
    }

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`;

    const requestBody = {
      client: {
        clientId: 'smart-bharat',
        clientVersion: '1.0',
      },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url }],
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      console.error("Safe Browsing provider failed", res.status);
      return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 502 });
    }

    const json = await res.json();
    // The API returns { matches: [...] } if threats found, otherwise {}
    const virusTotal = await scanWithVirusTotal(url, process.env.VIRUSTOTAL_API_KEY);
    return NextResponse.json({
      ok: true,
      matches: json.matches ?? null,
      virusTotal,
    });
  } catch (error) {
    console.error("Safe Browsing request failed", error);
    return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 500 });
  }
}
