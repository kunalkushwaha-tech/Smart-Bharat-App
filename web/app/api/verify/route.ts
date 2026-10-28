import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const signedIdPattern = /^BHRT-CYB-(\d{8})-(0[7-9]|10)-([A-Z0-9]{4})-([A-F0-9]{8})$/;
const legacyIdPattern = /^BHRT-CYB-[A-Z0-9]{4}-[A-Z0-9]{4}-(\d{8})$/;

function tierForScore(score: number) {
  if (score >= 9) return "Cyber Aware Citizen — Distinction";
  if (score >= 7) return "Cyber Aware Citizen";
  return "Getting Started";
}

function formatDate(datePart: string) {
  return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6)}`;
}

function invalidResponse() {
  return NextResponse.json({ valid: false, score: null, tier: null, issuedDate: null });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  const secret = process.env.CERT_SIGNING_SECRET;

  if (!secret) {
    const legacyMatch = legacyIdPattern.exec(id);
    if (!legacyMatch) return invalidResponse();
    return NextResponse.json({ valid: true, score: null, tier: null, issuedDate: formatDate(legacyMatch[1]), fallback: true });
  }

  const match = signedIdPattern.exec(id);
  if (!match) return invalidResponse();
  const [, datePart, scoreText, randomPart, signature] = match;
  const prefix = `BHRT-CYB-${datePart}-${scoreText}-${randomPart}`;
  const expected = createHmac("sha256", secret).update(prefix).digest("hex").slice(0, 8).toUpperCase();
  const isValid = timingSafeEqual(Buffer.from(signature, "ascii"), Buffer.from(expected, "ascii"));
  if (!isValid) return invalidResponse();

  const score = Number(scoreText);
  return NextResponse.json({ valid: true, score, tier: tierForScore(score), issuedDate: formatDate(datePart) });
}
