import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Fallback in-memory store for local dev or when Upstash Redis URL is not set
type MemoryRecord = { count: number; resetTime: number };
const memoryStore = new Map<string, MemoryRecord>();

function memoryLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    const secondsLeft = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      error: `Too many requests. Please wait ${secondsLeft} seconds before trying again.`,
    };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

// Initialize Upstash Redis instance if environment variables exist
const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Cache ratelimit instances by window config
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowSeconds: number) {
  const configKey = `${limit}-${windowSeconds}s`;
  if (!upstashLimiters.has(configKey) && redis) {
    upstashLimiters.set(
      configKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        analytics: true,
      }),
    );
  }
  return upstashLimiters.get(configKey);
}

/**
 * Check rate limit for an action
 * @param key Identifier e.g. "tweet:user_123" or "reply:user_123"
 * @param limit Max allowed requests (default 5)
 * @param windowSeconds Window duration in seconds (default 60s)
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowSeconds: number = 60,
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  if (hasUpstash && redis) {
    try {
      const ratelimit = getUpstashLimiter(limit, windowSeconds);
      if (ratelimit) {
        const res = await ratelimit.limit(key);
        if (!res.success) {
          const resetSeconds = Math.ceil((res.reset - Date.now()) / 1000);
          return {
            success: false,
            remaining: 0,
            error: `Too many requests. Please wait ${resetSeconds > 0 ? resetSeconds : 60} seconds before trying again.`,
          };
        }
        return { success: true, remaining: res.remaining };
      }
    } catch (e) {
      console.warn('Upstash rate limit failed, falling back to memory:', e);
    }
  }

  // Fallback to in-memory check if Upstash is not fully configured or throws
  return memoryLimit(key, limit, windowSeconds);
}
