import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Initialize Upstash Redis  set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// General API rate limit: 60 requests per 60 seconds per IP
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "ratelimit:api",
});

// Stricter rate limit for auth endpoints: 10 requests per 60 seconds
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// Strict rate limit for order/payment creation: 5 per minute
export const orderRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit:order",
});

// Upload rate limit: 20 per minute
export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "ratelimit:upload",
});

/**
 * Get client IP from request headers (works behind Vercel proxy)
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

/**
 * Check rate limit and return error response if exceeded.
 * Returns null if within limits.
 */
export async function checkRateLimit(
  request: NextRequest,
  limiter: Ratelimit = apiRateLimit
): Promise<NextResponse | null> {
  // Skip rate limiting if Upstash is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }

  const ip = getClientIp(request);
  const { success, limit, reset, remaining } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
