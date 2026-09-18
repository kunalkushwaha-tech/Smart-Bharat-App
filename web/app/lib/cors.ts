import { NextResponse } from "next/server";

function isAllowedOrigin(origin: string | null, request: Request) {
  if (!origin) return false;
  if (origin === new URL(request.url).origin) return true;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredOrigin && origin === configuredOrigin.replace(/\/$/, "")) return true;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

export function withCors(response: NextResponse, request: Request) {
  const origin = request.headers.get("origin");
  if (isAllowedOrigin(origin, request)) {
    response.headers.set("Access-Control-Allow-Origin", origin as string);
  }
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "600");
  return response;
}

export function corsPreflight(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request);
}
