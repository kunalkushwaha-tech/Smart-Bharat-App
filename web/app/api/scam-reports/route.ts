import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getRequestFingerprint, isRateLimited } from "../../lib/rateLimit";
import { corsPreflight, withCors } from "../../lib/cors";

const allowedScamTypes = new Set(["UPI", "Phishing", "Fake Job", "Investment", "OTP", "Other"]);
const contactPattern = /^(?:\+?[0-9][0-9\s().-]{6,19}|https?:\/\/[^\s]{1,200})$/i;

function isValidContact(value: string) {
  if (!contactPattern.test(value)) return false;
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
    } catch {
      return false;
    }
  }
  return true;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

function maskContact(value: string) {
  const trimmed = value.trim();
  if (/^\+?[0-9\s().-]+$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    return `••••${digits.slice(-4)}`;
  }
  try {
    const parsed = new URL(trimmed);
    return `${parsed.hostname}/••••`;
  } catch {
    return "••••";
  }
}

export async function GET(request: Request) {
  const client = getSupabase();
  if (!client) return withCors(NextResponse.json({ error: "Something went wrong, please try again" }, { status: 503 }), request);

  try {
    const { data, error } = await client
      .from("scam_reports_public")
      .select("id, created_at, scam_type, contact_info, description")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return withCors(NextResponse.json({ reports: data ?? [] }), request);
  } catch (error) {
    console.error("Failed to load scam reports", error);
    Sentry.captureException(error, { tags: { tool: "scam-reports", operation: "list" } });
    return withCors(NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 }), request);
  }
}

export async function POST(request: Request) {
  const fingerprint = getRequestFingerprint(request);
  if (isRateLimited(`scam-report:${fingerprint}`, 60_000)) {
    return withCors(NextResponse.json({ error: "Please wait before submitting another report" }, { status: 429 }), request);
  }

  const client = getSupabase();
  if (!client) return withCors(NextResponse.json({ error: "Something went wrong, please try again" }, { status: 503 }), request);

  try {
    const body = await request.json();
    const contactInfo = typeof body.contact_info === "string" ? body.contact_info.trim() : "";
    const scamType = typeof body.scam_type === "string" ? body.scam_type : "";
    const description = body.description === null || body.description === undefined
      ? null
      : typeof body.description === "string" ? body.description.trim() : undefined;

    if (!contactInfo || contactInfo.length > 200 || !isValidContact(contactInfo)
      || !allowedScamTypes.has(scamType)
      || description === undefined || (description && description.length > 500)) {
      return withCors(NextResponse.json({ error: "Invalid report details" }, { status: 400 }), request);
    }

    const { error } = await client.from("scam_reports").insert({
      scam_type: scamType,
      contact_info: maskContact(contactInfo),
      description: description || null,
    });
    if (error) throw error;
    return withCors(NextResponse.json({ ok: true }, { status: 201 }), request);
  } catch (error) {
    console.error("Failed to submit scam report", error);
    Sentry.captureException(error, { tags: { tool: "scam-reports", operation: "submit" } });
    return withCors(NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 }), request);
  }
}

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}
