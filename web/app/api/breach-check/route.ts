import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}?details=true`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) {
      console.error("XposedOrNot request failed", response.status);
      return NextResponse.json(
        { error: "The breach service is temporarily unavailable. Please try again later." },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (data.Error === 'Not found' || !data.breaches) {
      return NextResponse.json({ breaches: [] });
    }

    const rawBreaches = Array.isArray(data.breaches[0]) ? data.breaches[0] : data.breaches;
    const breaches = (Array.isArray(rawBreaches) ? rawBreaches : [])
      .map((breach: unknown) => {
        if (typeof breach === "string") return { name: breach };
        if (breach && typeof breach === "object") {
          const item = breach as Record<string, unknown>;
          const name = item.name ?? item.title ?? item.breach;
          if (typeof name === "string" && name.trim()) {
            const date = item.date ?? item.year ?? item.breach_date;
            return { name: name.trim(), ...(date ? { date: String(date) } : {}) };
          }
        }
        return null;
      })
      .filter((breach): breach is { name: string; date?: string } => breach !== null);

    return NextResponse.json({ breaches });
  } catch (error) {
    console.error("Breach check failed", error);
    Sentry.captureException(error, { tags: { tool: "email-breach-checker" } });
    return NextResponse.json({ error: 'Something went wrong, please try again' }, { status: 500 });
  }
}