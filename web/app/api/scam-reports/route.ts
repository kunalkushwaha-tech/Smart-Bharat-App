import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getRequestFingerprint, isRateLimited } from "../../lib/rateLimit";
import { corsPreflight, withCors } from "../../lib/cors";

const allowedScamTypes = new Set(["UPI", "Phishing", "Fake Job", "Investment", "OTP", "Other"]);
const contactPattern = /^(?:\+?[0-9][0-9\s().-]{6,19}|https?:\/\/[^\s]{1,200})$/i;
const SUPABASE_TIMEOUT_MS = 5000;

class SupabaseTimeoutError extends Error {
  constructor() {
    super("Supabase request timed out");
    this.name = "SupabaseTimeoutError";
  }
}

class SupabaseUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Supabase request failed", { cause });
    this.name = "SupabaseUnavailableError";
  }
}

async function withSupabaseTimeout<T>(operation: PromiseLike<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new SupabaseTimeoutError()), SUPABASE_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } catch (error) {
    if (error instanceof SupabaseTimeoutError) throw error;
    throw new SupabaseUnavailableError(error);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 500);
}

function normalizeValue(value: string) {
  const cleaned = stripHtml(value).toLowerCase();
  if (/^\+?[0-9\s().-]+$/.test(cleaned)) return cleaned.replace(/\D/g, "");
  try {
    const parsed = new URL(cleaned.includes("://") ? cleaned : `https://${cleaned}`);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((key) => parsed.searchParams.delete(key));
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return cleaned.replace(/\s+/g, " ");
  }

}

function isExtendedColumnError(error: unknown) {
  const record = error && typeof error === "object" ? error as { code?: string; message?: string } : {};
  return record.code === "PGRST204" || record.code === "42703"
    || /normalized_value|abuse_flags/i.test(record.message ?? "");
}

export async function GET(request: Request) {
  const client = getSupabase();
  if (!client) return withCors(NextResponse.json({ error: "not configured" }, { status: 503 }), request);

  try {
    let data: Array<Record<string, unknown>> | null = null;
    let error: unknown = null;
    try {
      const result = await withSupabaseTimeout(client
        .from("scam_reports_public")
        .select("id, created_at, scam_type, contact_info, description, normalized_value, abuse_flags")
        .order("created_at", { ascending: false })
        .limit(100));
      data = result.data as Array<Record<string, unknown>> | null;
      error = result.error;
    } catch (columnError) {
      console.error("Scam feed extended columns unavailable", columnError);
      if (!isExtendedColumnError(columnError)) throw columnError;
    }
    if (error && !isExtendedColumnError(error)) throw new SupabaseUnavailableError(error);
    if (error || !data) {
      const fallback = await withSupabaseTimeout(client
        .from("scam_reports_public")
        .select("id, created_at, scam_type, contact_info, description")
        .order("created_at", { ascending: false })
        .limit(100));
      data = fallback.data as Array<Record<string, unknown>> | null;
      error = fallback.error;
    }
    if (error) throw new SupabaseUnavailableError(error);
    const grouped = new Map<string, Record<string, unknown> & { reported_count: number }>();
    for (const raw of data ?? []) {
      const contactInfo = typeof raw.contact_info === "string" ? stripHtml(raw.contact_info).slice(0, 220) : "";
      const normalized = typeof raw.normalized_value === "string" && raw.normalized_value
        ? raw.normalized_value
        : normalizeValue(contactInfo);
      if (Number(raw.abuse_flags ?? 0) >= 3) continue;
      const report = {
        id: String(raw.id ?? ""),
        created_at: String(raw.created_at ?? ""),
        scam_type: typeof raw.scam_type === "string" ? stripHtml(raw.scam_type).slice(0, 80) : "Other",
        contact_info: contactInfo,
        description: typeof raw.description === "string" ? stripHtml(raw.description) : null,
        abuse_flags: Number(raw.abuse_flags ?? 0),
        reported_count: 1,
      };
      const existing = grouped.get(normalized);
      if (existing) {
        existing.reported_count += 1;
        if (new Date(report.created_at).getTime() > new Date(String(existing.created_at)).getTime()) {
          Object.assign(existing, report);
        }
      } else {
        grouped.set(normalized, report);
      }
    }
    return withCors(NextResponse.json({ reports: [...grouped.values()].slice(0, 20) }), request);
  } catch (error) {
    console.error("Failed to load scam reports", error);
    Sentry.captureException(error, { tags: { tool: "scam-reports", operation: "list" } });
    if (error instanceof SupabaseTimeoutError || error instanceof SupabaseUnavailableError) {
      return withCors(NextResponse.json({ error: "unreachable" }, { status: 503 }), request);
    }
    return withCors(NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 }), request);
  }
}

export async function POST(request: Request) {
  const fingerprint = getRequestFingerprint(request);
  if (isRateLimited(`scam-report:${fingerprint}`, 60_000)) {
    return withCors(NextResponse.json({ error: "Please wait before submitting another report" }, { status: 429 }), request);
  }

  const client = getSupabase();
  if (!client) return withCors(NextResponse.json({ error: "not configured" }, { status: 503 }), request);

  try {
    const body = await request.json();
    if (typeof body?.abuse_report_id === "string") {
      if (isRateLimited(`scam-abuse:${fingerprint}`, 60_000)) {
        return withCors(NextResponse.json({ error: "Please wait before reporting abuse again" }, { status: 429 }), request);
      }
      const id = body.abuse_report_id.trim();
      const current = await withSupabaseTimeout(client.from("scam_reports").select("abuse_flags").eq("id", id).maybeSingle());
      if (current.error) throw new SupabaseUnavailableError(current.error);
      const nextFlags = Number(current.data?.abuse_flags ?? 0) + 1;
      const update = await withSupabaseTimeout(client.from("scam_reports").update({ abuse_flags: nextFlags }).eq("id", id));
      if (update.error) throw new SupabaseUnavailableError(update.error);
      return withCors(NextResponse.json({ ok: true }), request);
    }
    const contactInfo = typeof body.contact_info === "string" ? stripHtml(body.contact_info).slice(0, 200) : "";
    const scamType = typeof body.scam_type === "string" ? body.scam_type : "";
    const description = body.description === null || body.description === undefined
      ? null
      : typeof body.description === "string" ? stripHtml(body.description) : undefined;

    if (!contactInfo || contactInfo.length > 200 || !isValidContact(contactInfo)
      || !allowedScamTypes.has(scamType)
      || description === undefined || (description && description.length > 500)) {
      return withCors(NextResponse.json({ error: "Invalid report details" }, { status: 400 }), request);
    }

    let { error } = await withSupabaseTimeout(client.from("scam_reports").insert({
      scam_type: scamType,
      contact_info: maskContact(contactInfo),
      normalized_value: normalizeValue(contactInfo),
      description: description || null,
    }));
    if (error && isExtendedColumnError(error)) {
      ({ error } = await withSupabaseTimeout(client.from("scam_reports").insert({
        scam_type: scamType,
        contact_info: maskContact(contactInfo),
        description: description || null,
      })));
    }
    if (error) throw new SupabaseUnavailableError(error);
    return withCors(NextResponse.json({ ok: true }, { status: 201 }), request);
  } catch (error) {
    console.error("Failed to submit scam report", error);
    Sentry.captureException(error, { tags: { tool: "scam-reports", operation: "submit" } });
    if (error instanceof SupabaseTimeoutError || error instanceof SupabaseUnavailableError) {
      return withCors(NextResponse.json({ error: "unreachable" }, { status: 503 }), request);
    }
    return withCors(NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 }), request);
  }
}

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}
