/**
 * Auth Resolvers
 * Handles 2FA and password reset operations
 */

import { z } from 'zod';
import { GraphQLError } from 'graphql';
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
import { env, getAllowedRedirectOrigins, authLogger, sendEmail } from '../../config';

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

const sendWaitlistWelcomeInputSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1).max(80).optional(),
  displayPosition: z.number().int().min(1),
  referralLink: z.string().url(),
  progressLink: z.string().url(),
});

const throwUserInputError = (message: string): never => {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
};

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
        throwUserInputError(rateLimitResult.error || 'Too many verification requests.');
      }

      // Generate OTP and create token
      const { code } = await createEmail2FAToken(validated.userId, validated.email);

      // Generate email content
      const { html, text } = templates.email2FA(code);

      // OTP emails are time-sensitive, so send immediately instead of waiting
      // for the periodic queue worker.
      const delivery = await sendEmail({
        to: validated.email,
        from: env.FROM_EMAIL,
        subject: 'Your verification code',
        html,
        text,
      });
      if (!delivery.success) {
        authLogger.error(
          {
            email: validated.email,
            userId: validated.userId,
            error: delivery.error,
          },
          '2FA delivery failed'
        );
        throw new GraphQLError(
          'Could not send verification email right now. Please try again in a minute.',
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

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
        throwUserInputError(result.error || 'Verification failed');
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
        throwUserInputError('Invalid redirect URL');
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
        throwUserInputError(rateLimitResult.error || 'Too many password reset requests.');
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

      // Password reset should also be delivered immediately to avoid token
      // delays while queued.
      const delivery = await sendEmail({
        to: validated.email,
        from: env.FROM_EMAIL,
        subject: 'Reset your password',
        html,
        text,
      });
      if (!delivery.success) {
        authLogger.error(
          {
            email: validated.email,
            userId: validated.userId,
            error: delivery.error,
          },
          'Password reset delivery failed'
        );
        throw new GraphQLError(
          'Could not send reset email right now. Please try again in a minute.',
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

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
        throwUserInputError(result.error || 'Token validation failed');
      }

      return true;
    },

    /**
     * Send waitlist welcome email
     */
    sendWaitlistWelcome: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          email: string;
          name?: string;
          displayPosition: number;
          referralLink: string;
          progressLink: string;
        };
      },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      requireService(ctx);
      const validated = sendWaitlistWelcomeInputSchema.parse(input);
      const { html, text } = templates.waitlistWelcome({
        name: validated.name,
        displayPosition: validated.displayPosition,
        referralLink: validated.referralLink,
        progressLink: validated.progressLink,
      });

      await enqueueTransactionalEmail({
        toEmail: validated.email,
        subject: 'You are on the ClassEcon waitlist',
        html,
        text,
      });

      authLogger.info(
        { email: validated.email, displayPosition: validated.displayPosition },
        'Waitlist welcome email sent'
      );

      return true;
    },
  },
};
