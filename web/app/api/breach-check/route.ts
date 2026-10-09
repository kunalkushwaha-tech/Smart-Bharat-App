import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`
    );

    const data = await response.json();

    if (data.Error === 'Not found' || !data.breaches) {
      return NextResponse.json({ breaches: [] });
    }

    // data.breaches looks like: [["Tesco", "Adobe", "LinkedIn"]]
    const breachNames: string[] = data.breaches[0] || [];

    return NextResponse.json({ breaches: breachNames });
  } catch (error) {
    console.error("Breach check failed", error);
    return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 500 });
  }
}