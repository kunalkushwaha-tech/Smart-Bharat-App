import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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
    return NextResponse.json(
      { error: 'Server error while checking breaches' },
      { status: 500 }
    );
  }
}