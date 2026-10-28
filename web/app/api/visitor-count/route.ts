import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch("https://api.countapi.xyz/hit/bharat-app-kunal/visits", {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return new NextResponse(null, { status: 204 });
    const data = (await response.json()) as { value?: number };
    return typeof data.value === "number"
      ? NextResponse.json({ value: data.value })
      : new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
