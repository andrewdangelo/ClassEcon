/**
 * Environment Configuration
 * Validates all required environment variables using Zod
 */

import { z } from 'zod';

const envSchema = z
  .object({
    // Server
    PORT: z.string().default('4000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // MongoDB
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_DB_NAME: z.string().default('email_service'),

    /** auto: use SMTP if SMTP_HOST set, else Resend if RESEND_API_KEY set */
    EMAIL_TRANSPORT: z.enum(['auto', 'smtp', 'resend']).default('auto'),

    // Resend (optional if using SMTP)
    RESEND_API_KEY: z
      .string()
      .optional()
      .transform((s) => (s && s.trim() ? s.trim() : undefined)),

    // SMTP (optional if using Resend)
    SMTP_HOST: z
      .string()
      .optional()
      .transform((s) => (s && s.trim() ? s.trim() : undefined)),
    SMTP_PORT: z
      .string()
      .default('587')
      .transform((s) => Number.parseInt(s, 10) || 587),
    /** Use true for port 465 (implicit TLS) */
    SMTP_SECURE: z
      .string()
      .default('false')
      .transform((s) => s === 'true' || s === '1'),
    SMTP_USER: z
      .string()
      .optional()
      .transform((s) => (s !== undefined && s !== '' ? s : undefined)),
    SMTP_PASS: z
      .string()
      .optional()
      .transform((s) => (s !== undefined ? s : undefined)),
    /** Set false only for dev / self-signed SMTP (default true) */
    SMTP_REJECT_UNAUTHORIZED: z
      .string()
      .default('true')
      .transform((s) => s === 'true' || s === '1'),

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
  })
  .superRefine((data, ctx) => {
    const mode = data.EMAIL_TRANSPORT;
    const hasSmtp = Boolean(data.SMTP_HOST);
    const hasResend = Boolean(data.RESEND_API_KEY);

    if (mode === 'auto') {
      if (!hasSmtp && !hasResend) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Set SMTP_HOST for SMTP and/or RESEND_API_KEY for Resend (EMAIL_TRANSPORT=auto requires at least one).',
          path: ['EMAIL_TRANSPORT'],
        });
      }
    } else if (mode === 'smtp') {
      if (!hasSmtp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SMTP_HOST is required when EMAIL_TRANSPORT=smtp',
          path: ['SMTP_HOST'],
        });
      }
    } else if (mode === 'resend') {
      if (!hasResend) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'RESEND_API_KEY is required when EMAIL_TRANSPORT=resend',
          path: ['RESEND_API_KEY'],
        });
      }
    }
  });

// Parse and validate environment
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    console.error(parsed.error.issues);
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();

/**
 * Resolved outbound transport. With EMAIL_TRANSPORT=auto, SMTP wins when SMTP_HOST is set.
 */
export const getMailTransport = (): 'smtp' | 'resend' => {
  const mode = env.EMAIL_TRANSPORT;
  if (mode === 'smtp') return 'smtp';
  if (mode === 'resend') return 'resend';
  if (env.SMTP_HOST) return 'smtp';
  if (env.RESEND_API_KEY) return 'resend';
  throw new Error('No mail transport configured (SMTP_HOST or RESEND_API_KEY)');
};

// Helper to get allowed redirect origins as array
export const getAllowedRedirectOrigins = (): string[] => {
  if (!env.ALLOWED_REDIRECT_ORIGINS) return [];
  return env.ALLOWED_REDIRECT_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
};

export type Env = z.infer<typeof envSchema>;
