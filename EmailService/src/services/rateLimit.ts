/**
 * Rate Limiting Service
 * MongoDB-backed rate limiting with in-memory caching
 */

import { RateLimit } from '../models';
import { env, logger } from '../config';

// In-memory cache for hot paths
const memoryCache = new Map<string, { count: number; resetAt: Date }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check rate limit for a given key
 */
export const checkRateLimit = async (
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> => {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  // Check memory cache first
  const cached = memoryCache.get(key);
  if (cached && cached.resetAt > now) {
    if (cached.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: cached.resetAt,
      };
    }
  }

  try {
    // Atomic upsert in MongoDB
    const result = await RateLimit.findOneAndUpdate(
      { key },
      {
        $setOnInsert: { resetAt },
        $inc: { count: 1 },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Check if the window has expired
    if (result.resetAt <= now) {
      // Reset the counter
      await RateLimit.updateOne(
        { key },
        { $set: { count: 1, resetAt } }
      );

      memoryCache.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt,
      };
    }

    // Update memory cache
    memoryCache.set(key, { count: result.count, resetAt: result.resetAt });

    const allowed = result.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - result.count),
      resetAt: result.resetAt,
    };
  } catch (error) {
    logger.error({ error, key }, 'Rate limit check failed');
    // Fail open (allow) on database errors to prevent service disruption
    return {
      allowed: true,
      remaining: limit,
      resetAt,
    };
  }
};

/**
 * Check cooldown (only 1 request per window)
 */
export const checkCooldown = async (
  key: string,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> => {
  const result = await checkRateLimit(key, 1, windowMs);
  const retryAfterMs = result.allowed ? 0 : result.resetAt.getTime() - Date.now();
  return {
    allowed: result.allowed,
    retryAfterMs: Math.max(0, retryAfterMs),
  };
};

/**
 * Rate limit configurations for 2FA
 */
export const check2FARateLimits = async (
  email: string,
  userId: string,
  ip?: string
): Promise<{ allowed: boolean; error?: string }> => {
  const hourMs = 60 * 60 * 1000;

  // Check per-email limit
  const emailLimit = await checkRateLimit(
    `2fa:email:${email.toLowerCase()}`,
    env.RATE_LIMIT_2FA_PER_EMAIL_HOUR,
    hourMs
  );
  if (!emailLimit.allowed) {
    return {
      allowed: false,
      error: 'Too many verification requests for this email. Please try again later.',
    };
  }

  // Check per-user limit
  const userLimit = await checkRateLimit(
    `2fa:user:${userId}`,
    env.RATE_LIMIT_2FA_PER_USER_HOUR,
    hourMs
  );
  if (!userLimit.allowed) {
    return {
      allowed: false,
      error: 'Too many verification requests. Please try again later.',
    };
  }

  // Check per-IP limit if IP is provided
  if (ip) {
    const ipLimit = await checkRateLimit(
      `2fa:ip:${ip}`,
      env.RATE_LIMIT_2FA_PER_IP_HOUR,
      hourMs
    );
    if (!ipLimit.allowed) {
      return {
        allowed: false,
        error: 'Too many requests from this IP. Please try again later.',
      };
    }
  }

  // Check cooldown (1 per minute per email)
  const cooldown = await checkCooldown(
    `2fa:cooldown:${email.toLowerCase()}`,
    env.RATE_LIMIT_2FA_COOLDOWN_SECONDS * 1000
  );
  if (!cooldown.allowed) {
    return {
      allowed: false,
      error: `Please wait ${Math.ceil(cooldown.retryAfterMs / 1000)} seconds before requesting another code.`,
    };
  }

  return { allowed: true };
};

/**
 * Rate limit configurations for password reset
 */
export const checkPasswordResetRateLimits = async (
  email: string,
  userId: string,
  ip?: string
): Promise<{ allowed: boolean; error?: string }> => {
  const hourMs = 60 * 60 * 1000;

  // Stricter limits for password reset
  const emailLimit = await checkRateLimit(
    `reset:email:${email.toLowerCase()}`,
    3, // Max 3 per hour per email
    hourMs
  );
  if (!emailLimit.allowed) {
    return {
      allowed: false,
      error: 'Too many password reset requests. Please try again later.',
    };
  }

  // Check per-IP limit
  if (ip) {
    const ipLimit = await checkRateLimit(
      `reset:ip:${ip}`,
      5, // Max 5 per hour per IP
      hourMs
    );
    if (!ipLimit.allowed) {
      return {
        allowed: false,
        error: 'Too many requests from this IP. Please try again later.',
      };
    }
  }

  // Cooldown: 2 minutes between reset requests
  const cooldown = await checkCooldown(
    `reset:cooldown:${email.toLowerCase()}`,
    2 * 60 * 1000
  );
  if (!cooldown.allowed) {
    return {
      allowed: false,
      error: `Please wait ${Math.ceil(cooldown.retryAfterMs / 1000)} seconds before requesting another reset link.`,
    };
  }

  return { allowed: true };
};

// Cleanup old entries from memory cache periodically
setInterval(() => {
  const now = new Date();
  for (const [key, value] of memoryCache.entries()) {
    if (value.resetAt <= now) {
      memoryCache.delete(key);
    }
  }
}, 60 * 1000); // Every minute
