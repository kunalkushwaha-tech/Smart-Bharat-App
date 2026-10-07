const requestTimestamps = new Map<string, number>();

// This is suitable for a single-region instance. Use a distributed store such as Redis for multi-instance production deployments.
export function isRateLimited(key: string, windowMs: number) {
  const now = Date.now();
  const previous = requestTimestamps.get(key);
  if (previous && now - previous < windowMs) return true;
  requestTimestamps.set(key, now);
  return false;
}

export function getRequestFingerprint(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}
