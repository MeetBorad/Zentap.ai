/**
 * ZenTap.ai — API Rate Limiting & Leveling System
 *
 * Implements a high-performance in-memory sliding window rate limiter
 * to protect public endpoints, AI generation routes, and checkout flows
 * from brute force, scraping, and abusive traffic.
 */

export interface RateLimitConfig {
  limit: number;      // Maximum requests allowed in window
  windowMs: number;   // Window duration in milliseconds
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window store
const rateLimitMap = new Map<string, RateLimitRecord>();

// Predefined tiers
export const RATE_LIMIT_TIERS: Record<"SENSITIVE" | "STANDARD" | "TELEMETRY", RateLimitConfig> = {
  // Strictest: AI review generation & checkout creation (10 requests / min)
  SENSITIVE: { limit: 10, windowMs: 60 * 1000 },
  // Standard: Platform APIs, admin actions, lead submits (60 requests / min)
  STANDARD: { limit: 60, windowMs: 60 * 1000 },
  // Lenient: High-throughput telemetry, physical NFC/QR taps (180 requests / min)
  TELEMETRY: { limit: 180, windowMs: 60 * 1000 },
};

/**
 * Check and record a request against the rate limiter.
 *
 * @param identifier Client IP, Token, or Device identifier
 * @param config Rate limit tier rules
 * @returns { success: boolean, limit: number, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_TIERS.STANDARD
): {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = `${identifier}`;

  // Periodic cleanup of stale entries when map exceeds 5000 items
  if (rateLimitMap.size > 5000) {
    const purgeTime = Date.now();
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetAt < purgeTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  const existing = rateLimitMap.get(key);

  if (!existing || existing.resetAt < now) {
    // New window
    const resetAt = now + config.windowMs;
    rateLimitMap.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Existing window
  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  };
}
