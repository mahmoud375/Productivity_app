import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

/**
 * Fail-open rate limiter.
 * If UPSTASH_REDIS_REST_URL is not set, all requests are silently allowed.
 */

let ratelimit: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    // 30 requests per 10 seconds sliding window
    limiter: Ratelimit.slidingWindow(30, "10 s"),
    analytics: true,
    prefix: "taskflow:ratelimit",
  });
}

interface RateLimitResult {
  success: boolean;
  headers: Headers;
}

/**
 * Checks rate limit for a given identifier.
 * Fail-open: returns success=true if Redis is not configured.
 */
export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  if (!ratelimit) {
    return { success: true, headers: new Headers() };
  }

  try {
    const { success, limit, remaining, reset } =
      await ratelimit.limit(identifier);

    const headers = new Headers();
    headers.set("X-RateLimit-Limit", String(limit));
    headers.set("X-RateLimit-Remaining", String(remaining));
    headers.set("X-RateLimit-Reset", String(reset));

    return { success, headers };
  } catch {
    // Fail-open: if Redis is down, allow the request
    return { success: true, headers: new Headers() };
  }
}

/**
 * Returns a 429 response with rate limit headers.
 */
export function rateLimitResponse(headers: Headers): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: Object.fromEntries(headers.entries()),
    }
  );
}
