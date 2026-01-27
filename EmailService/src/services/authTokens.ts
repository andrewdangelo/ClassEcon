/**
 * Auth Tokens Service
 * Handles OTP generation, hashing, verification, and password reset tokens
 * IMPORTANT: Never stores raw tokens, only hashes
 */

import * as argon2 from 'argon2';
import crypto from 'crypto';
import { AuthToken, type TokenPurpose, type IAuthToken } from '../models';
import { env, authLogger } from '../config';

const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit numeric OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a secure random token (32 bytes, base64url encoded)
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};

/**
 * Hash a token/code using Argon2
 */
export const hashToken = async (token: string): Promise<string> => {
  return argon2.hash(token, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
};

/**
 * Verify a token against its hash
 */
export const verifyTokenHash = async (token: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, token);
  } catch {
    return false;
  }
};

/**
 * Create a new auth token (OTP or reset token)
 */
export const createAuthToken = async (params: {
  userId: string;
  email: string;
  purpose: TokenPurpose;
  token: string;
  expiryMinutes: number;
  meta?: Record<string, unknown>;
}): Promise<IAuthToken> => {
  const { userId, email, purpose, token, expiryMinutes, meta } = params;

  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const authToken = await AuthToken.create({
    userId,
    email: email.toLowerCase().trim(),
    purpose,
    tokenHash,
    expiresAt,
    meta,
  });

  authLogger.debug(
    { userId, email, purpose, expiresAt },
    'Created auth token'
  );

  return authToken;
};

/**
 * Create Email 2FA token
 */
export const createEmail2FAToken = async (
  userId: string,
  email: string
): Promise<{ token: IAuthToken; code: string }> => {
  const code = generateOTP();

  const token = await createAuthToken({
    userId,
    email,
    purpose: 'EMAIL_2FA',
    token: code,
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
  });

  return { token, code };
};

/**
 * Create Password Reset token
 */
export const createPasswordResetToken = async (
  userId: string,
  email: string,
  redirectUrl: string
): Promise<{ token: IAuthToken; rawToken: string }> => {
  const rawToken = generateSecureToken();

  const token = await createAuthToken({
    userId,
    email,
    purpose: 'PASSWORD_RESET',
    token: rawToken,
    expiryMinutes: env.RESET_TOKEN_EXPIRY_MINUTES,
    meta: { redirectUrl },
  });

  return { token, rawToken };
};

/**
 * Find the latest valid (unconsumed, not expired) token
 */
export const findValidToken = async (
  email: string,
  purpose: TokenPurpose
): Promise<IAuthToken | null> => {
  const token = await AuthToken.findOne({
    email: email.toLowerCase().trim(),
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .exec();

  return token;
};

/**
 * Find valid token by userId
 */
export const findValidTokenByUserId = async (
  userId: string,
  email: string,
  purpose: TokenPurpose
): Promise<IAuthToken | null> => {
  const token = await AuthToken.findOne({
    userId,
    email: email.toLowerCase().trim(),
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .exec();

  return token;
};

/**
 * Verify an OTP code
 * Returns: { success: boolean; error?: string }
 */
export const verifyEmail2FA = async (
  userId: string,
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> => {
  const token = await findValidTokenByUserId(userId, email, 'EMAIL_2FA');

  if (!token) {
    authLogger.warn({ userId, email }, 'No valid 2FA token found');
    return { success: false, error: 'No valid code found or code expired' };
  }

  // Check if locked out
  if (token.attemptCount >= MAX_ATTEMPTS) {
    authLogger.warn({ userId, email, attempts: token.attemptCount }, '2FA lockout');
    return { success: false, error: 'Too many attempts. Please request a new code.' };
  }

  // Verify the code
  const isValid = await verifyTokenHash(code, token.tokenHash);

  if (!isValid) {
    // Increment attempt count
    await AuthToken.updateOne(
      { _id: token._id },
      { $inc: { attemptCount: 1 } }
    );

    authLogger.warn(
      { userId, email, attempts: token.attemptCount + 1 },
      'Invalid 2FA code attempt'
    );

    return { success: false, error: 'Invalid code' };
  }

  // Mark as consumed
  await AuthToken.updateOne(
    { _id: token._id },
    { $set: { consumedAt: new Date() } }
  );

  authLogger.info({ userId, email }, '2FA verified successfully');

  return { success: true };
};

/**
 * Consume a password reset token
 * Returns: { success: boolean; error?: string }
 */
export const consumePasswordReset = async (
  email: string,
  rawToken: string
): Promise<{ success: boolean; error?: string }> => {
  const token = await findValidToken(email, 'PASSWORD_RESET');

  if (!token) {
    authLogger.warn({ email }, 'No valid password reset token found');
    return { success: false, error: 'Invalid or expired reset link' };
  }

  // Check if locked out
  if (token.attemptCount >= MAX_ATTEMPTS) {
    authLogger.warn({ email, attempts: token.attemptCount }, 'Password reset lockout');
    return { success: false, error: 'Too many attempts. Please request a new reset link.' };
  }

  // Verify the token
  const isValid = await verifyTokenHash(rawToken, token.tokenHash);

  if (!isValid) {
    // Increment attempt count
    await AuthToken.updateOne(
      { _id: token._id },
      { $inc: { attemptCount: 1 } }
    );

    authLogger.warn(
      { email, attempts: token.attemptCount + 1 },
      'Invalid password reset token attempt'
    );

    return { success: false, error: 'Invalid reset link' };
  }

  // Mark as consumed
  await AuthToken.updateOne(
    { _id: token._id },
    { $set: { consumedAt: new Date() } }
  );

  authLogger.info({ email }, 'Password reset token consumed');

  return { success: true };
};
