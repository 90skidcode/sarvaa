import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // silently degrade — cache is best-effort
  }
}

export async function invalidatePrefix(prefix: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(...(keys as [string, ...string[]]));
    }
  } catch {
    // silently degrade
  }
}

export const CACHE_TTL = {
  products: 120,   // 2 min — matches s-maxage
  categories: 300, // 5 min — rarely change
  banners: 300,    // 5 min
} as const;
