import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QUERY_TIMEOUT_MS = 5000;

function noStoreJson(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function unauthorized() {
  return new NextResponse(null, {
    status: 401,
    headers: { "Cache-Control": "no-store" },
  });
}

function hasMatchingSecret(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length
    && timingSafeEqual(providedBuffer, expectedBuffer);
}

async function withTimeout<T>(operation: PromiseLike<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Supabase query timed out")), QUERY_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return noStoreJson({ error: "temporarily unavailable" }, 503);

  const authorization = request.headers.get("authorization") ?? "";
  const providedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (!hasMatchingSecret(providedSecret, cronSecret)) return unauthorized();

  const client = getSupabase();
  if (!client) return noStoreJson({ error: "temporarily unavailable" }, 503);

  try {
    const countResult = await withTimeout(
      client.from("scam_reports").select("id", { count: "exact", head: true }),
    );
    if (countResult.error) throw countResult.error;

    const reportResult = await withTimeout(
      client.from("scam_reports").select("id").limit(1),
    );
    if (reportResult.error) throw reportResult.error;

    const cacheResult = await withTimeout(
      client.from("url_scan_cache").select("url").limit(1),
    );
    if (cacheResult.error) {
      if (/relation .*url_scan_cache.* does not exist|could not find the table/i.test(cacheResult.error.message)) {
        console.warn("Keep-alive query skipped missing url_scan_cache table");
      } else {
        throw cacheResult.error;
      }
    }

    return noStoreJson({ ok: true, ts: new Date().toISOString() });
  } catch (error) {
    console.error("Keep-alive Supabase query failed", error instanceof Error ? error.message : "unknown error");
    return noStoreJson({ error: "temporarily unavailable" }, 503);
  }
}
