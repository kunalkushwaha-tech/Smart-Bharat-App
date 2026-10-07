import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get('domain')?.trim();
  if (!domain) return NextResponse.json({ error: 'Enter a domain name.' }, { status: 400 });

  const apiKey = process.env.WHOISXML_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'WHOIS lookup is not configured yet. Add WHOISXML_API_KEY to the server environment.' },
      { status: 503 },
    );
  }

  const endpoint = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}&outputFormat=JSON`;
  try {
    const response = await fetch(endpoint);
    const data: unknown = await response.json();
    if (!response.ok) return NextResponse.json({ error: 'WHOIS provider returned an error.' }, { status: 502 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'WHOIS provider could not be reached. Try again later.' }, { status: 502 });
  }
}
