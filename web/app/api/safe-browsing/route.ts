import { NextResponse } from 'next/server';

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
    return NextResponse.json({ ok: true, matches: json.matches ?? null });
  } catch (error) {
    console.error("Safe Browsing request failed", error);
    return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 500 });
  }
}
