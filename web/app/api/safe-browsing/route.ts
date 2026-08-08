import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'GOOGLE_SAFE_BROWSING_API_KEY not configured on server' }, { status: 400 });
    }

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`;

    const body = {
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
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'Safe Browsing API error', status: res.status, detail: text }, { status: 500 });
    }

    const json = await res.json();
    // The API returns { matches: [...] } if threats found, otherwise {}
    return NextResponse.json({ ok: true, matches: json.matches ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
