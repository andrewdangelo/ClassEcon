/**
 * Auth Resolvers
 * Handles 2FA and password reset operations
 */

import { z } from 'zod';
import { requireService, type GraphQLContext } from '../context';
import {
  createEmail2FAToken,
  createPasswordResetToken,
  verifyEmail2FA,
  consumePasswordReset,
} from '../../services/authTokens';
import {
  check2FARateLimits,
  checkPasswordResetRateLimits,
} from '../../services/rateLimit';
import { enqueueTransactionalEmail, templates } from '../../services/delivery';
import { env, getAllowedRedirectOrigins, authLogger } from '../../config';

// Input validation schemas
const emailSchema = z.string().email().toLowerCase().trim();
const userIdSchema = z.string().min(1);
const codeSchema = z.string().min(4).max(10);
const tokenSchema = z.string().min(20);

const sendEmail2FAInputSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
});

const verifyEmail2FAInputSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
  code: codeSchema,
});

const sendPasswordResetInputSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
  redirectUrl: z.string().url(),
});

const consumePasswordResetInputSchema = z.object({
  email: emailSchema,
  token: tokenSchema,
});

/**
 * Validate redirect URL against allowed origins
 */
const validateRedirectUrl = (redirectUrl: string): boolean => {
  const allowedOrigins = getAllowedRedirectOrigins();
  
  // If no origins configured, allow all (development mode)
  if (allowedOrigins.length === 0) {
    authLogger.warn('No ALLOWED_REDIRECT_ORIGINS configured - allowing all origins');
    return true;
  }

  try {
    const url = new URL(redirectUrl);
    return allowedOrigins.some((origin) => {
      const allowedUrl = new URL(origin);
      return url.origin === allowedUrl.origin;
    });
  } catch {
    return false;
  }
};

export const authResolvers = {
  Mutation: {
    /**
     * Send Email 2FA code
     */
    sendEmail2FA: async (
      _parent: unknown,
      { input }: { input: { userId: string; email: string } },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      // Require service auth
      requireService(ctx);

      // Validate input
      const validated = sendEmail2FAInputSchema.parse(input);

      // Check rate limits
      const rateLimitResult = await check2FARateLimits(
        validated.email,
        validated.userId,
        ctx.clientIp
      );

      if (!rateLimitResult.allowed) {
        authLogger.warn(
          { email: validated.email, userId: validated.userId, error: rateLimitResult.error },
          '2FA rate limited'
        );
        throw new Error(rateLimitResult.error);
      }

      // Generate OTP and create token
      const { code } = await createEmail2FAToken(validated.userId, validated.email);

      // Generate email content
      const { html, text } = templates.email2FA(code);

      // Enqueue email for delivery
      await enqueueTransactionalEmail({
        toEmail: validated.email,
        subject: 'Your verification code',
        html,
        text,
      });

      authLogger.info(
        { email: validated.email, userId: validated.userId },
        '2FA code sent'
      );

      // Never return the code in the response
      return true;
    },

    /**
     * Verify Email 2FA code
     */
    verifyEmail2FA: async (
      _parent: unknown,
      { input }: { input: { userId: string; email: string; code: string } },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      // Require service auth
      requireService(ctx);

      // Validate input
      const validated = verifyEmail2FAInputSchema.parse(input);

      // Verify the code
      const result = await verifyEmail2FA(
        validated.userId,
        validated.email,
        validated.code
      );

      if (!result.success) {
        throw new Error(result.error || 'Verification failed');
      }

      return true;
    },

    /**
     * Send password reset email
     */
    sendPasswordReset: async (
      _parent: unknown,
      { input }: { input: { userId: string; email: string; redirectUrl: string } },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      // Require service auth
      requireService(ctx);

      // Validate input
      const validated = sendPasswordResetInputSchema.parse(input);

      // Validate redirect URL
      if (!validateRedirectUrl(validated.redirectUrl)) {
        authLogger.warn(
          { email: validated.email, redirectUrl: validated.redirectUrl },
          'Invalid redirect URL for password reset'
        );
        throw new Error('Invalid redirect URL');
      }

      // Check rate limits
      const rateLimitResult = await checkPasswordResetRateLimits(
        validated.email,
        validated.userId,
        ctx.clientIp
      );

      if (!rateLimitResult.allowed) {
        authLogger.warn(
          { email: validated.email, error: rateLimitResult.error },
          'Password reset rate limited'
        );
        throw new Error(rateLimitResult.error);
      }

      // Generate reset token
      const { rawToken } = await createPasswordResetToken(
        validated.userId,
        validated.email,
        validated.redirectUrl
      );

      // Build reset URL
      const resetUrl = `${validated.redirectUrl}?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(validated.email)}`;

      // Generate email content
      const { html, text } = templates.passwordReset(resetUrl);

      // Enqueue email for delivery
      await enqueueTransactionalEmail({
        toEmail: validated.email,
        subject: 'Reset your password',
        html,
        text,
      });

      authLogger.info(
        { email: validated.email, userId: validated.userId },
        'Password reset email sent'
      );

      return true;
    },

    /**
     * Consume password reset token
     */
    consumePasswordReset: async (
      _parent: unknown,
      { input }: { input: { email: string; token: string } },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      // Require service auth
      requireService(ctx);

      // Validate input
      const validated = consumePasswordResetInputSchema.parse(input);

      // Consume the token
      const result = await consumePasswordReset(validated.email, validated.token);

      if (!result.success) {
        throw new Error(result.error || 'Token validation failed');
      }

      return true;
    },
  },
};
