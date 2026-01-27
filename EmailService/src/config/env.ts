/**
 * Environment Configuration
 * Validates all required environment variables using Zod
 */

import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().default('email_service'),

  // Resend
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  FROM_EMAIL: z.string().email('FROM_EMAIL must be a valid email'),

  // Application
  APP_URL: z.string().url('APP_URL must be a valid URL'),

  // Authentication
  ADMIN_TOKEN: z.string().min(32, 'ADMIN_TOKEN must be at least 32 characters'),
  SERVICE_TOKEN: z.string().min(32, 'SERVICE_TOKEN must be at least 32 characters'),
  WEBHOOK_SECRET: z.string().min(16, 'WEBHOOK_SECRET must be at least 16 characters'),

  // Worker configuration
  WORKER_CONCURRENCY: z.string().default('5').transform(Number),
  WORKER_MAX_ATTEMPTS: z.string().default('5').transform(Number),
  WORKER_SENDS_PER_SECOND: z.string().default('10').transform(Number),
  WORKER_POLL_INTERVAL_MS: z.string().default('1000').transform(Number),

  // Rate limiting
  RATE_LIMIT_2FA_PER_EMAIL_HOUR: z.string().default('5').transform(Number),
  RATE_LIMIT_2FA_PER_USER_HOUR: z.string().default('5').transform(Number),
  RATE_LIMIT_2FA_PER_IP_HOUR: z.string().default('10').transform(Number),
  RATE_LIMIT_2FA_COOLDOWN_SECONDS: z.string().default('60').transform(Number),

  // Token configuration
  OTP_EXPIRY_MINUTES: z.string().default('10').transform(Number),
  RESET_TOKEN_EXPIRY_MINUTES: z.string().default('60').transform(Number),

  // HMAC secret for unsubscribe tokens
  UNSUBSCRIBE_HMAC_SECRET: z.string().min(32).optional(),

  // Allowed redirect URLs for password reset (comma-separated)
  ALLOWED_REDIRECT_ORIGINS: z.string().default(''),
});

// Parse and validate environment
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();

// Helper to get allowed redirect origins as array
export const getAllowedRedirectOrigins = (): string[] => {
  if (!env.ALLOWED_REDIRECT_ORIGINS) return [];
  return env.ALLOWED_REDIRECT_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
};

export type Env = z.infer<typeof envSchema>;
