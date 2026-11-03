import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  try {
    const client = createClient(url, key);
    const { error } = await client.from("scam_reports_public").select("id").limit(1);
    if (error) return NextResponse.json({ ok: false, error: "unreachable" }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 503 });
  }
}
