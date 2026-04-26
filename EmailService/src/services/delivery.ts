/**
 * Delivery Service
 * Enqueues emails for delivery and provides email templates
 */

import { DeliveryJob, type JobType, Subscriber } from '../models';
import { env } from '../config';
import crypto from 'crypto';

/**
 * Email templates
 */
export const templates = {
  /**
   * 2FA verification code email
   */
  email2FA: (code: string): { html: string; text: string } => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Verification Code</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-bottom: 30px;">Please use the following code to verify your email address:</p>
    <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 30px;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
    </div>
    <p style="color: #666; font-size: 14px; margin-bottom: 0;">This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
    <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
  </div>
</body>
</html>`;

    const text = `Your verification code is: ${code}\n\nThis code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, please ignore this email.`;

    return { html, text };
  },

  /**
   * Password reset email
   */
  passwordReset: (resetUrl: string): { html: string; text: string } => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
  </div>
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-bottom: 30px;">We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; font-size: 12px; color: #666;">${resetUrl}</p>
    <p style="color: #666; font-size: 14px; margin-bottom: 0;">This link will expire in ${env.RESET_TOKEN_EXPIRY_MINUTES} minutes.</p>
    <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
  </div>
</body>
</html>`;

    const text = `Reset Your Password\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in ${env.RESET_TOKEN_EXPIRY_MINUTES} minutes.\n\nIf you didn't request a password reset, please ignore this email.`;

    return { html, text };
  },

  /**
   * Waitlist welcome email with referral CTA
   */
  waitlistWelcome: (params: {
    name?: string;
    displayPosition: number;
    referralLink: string;
    progressLink: string;
  }): { html: string; text: string } => {
    const friendlyName = params.name?.trim() || 'there';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You are on the ClassEcon waitlist</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to the ClassEcon waitlist</h1>
  </div>
  <div style="background: #ffffff; padding: 36px 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
    <p>Hi ${friendlyName},</p>
    <p>Thanks for signing up. Your current waitlist position is:</p>
    <div style="background: #f8fafc; border: 2px solid #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 34px; font-weight: 700; color: #1e3a8a;">#${params.displayPosition}</span>
    </div>
    <p>Want to move up faster? Share your referral link:</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin: 12px 0; word-break: break-all; font-size: 13px; color: #334155;">
      ${params.referralLink}
    </div>
    <p style="color: #334155; font-size: 14px;">
      Every successful referral helps you climb the list. Hit 5 referrals to unlock a major position boost.
    </p>
    <p style="color: #334155; font-size: 14px;">
      Check your current position anytime:
      <br />
      <a href="${params.progressLink}" style="color: #1d4ed8; text-decoration: underline;">${params.progressLink}</a>
    </p>
    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;

    const text = `Hi ${friendlyName},

Thanks for joining the ClassEcon waitlist.
Your current position: #${params.displayPosition}

Share your referral link to move up:
${params.referralLink}

Every successful referral helps you climb the list.

Check your progress anytime:
${params.progressLink}`;

    return { html, text };
  },

  /**
   * Campaign email wrapper with unsubscribe footer
   */
  campaignWrapper: (
    content: string,
    unsubscribeUrl: string
  ): { html: string } => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${content}
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center;">
    <p style="color: #999; font-size: 12px;">
      You received this email because you're subscribed to our mailing list.
      <br>
      <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

    return { html };
  },
};

/**
 * Generate unsubscribe token for a subscriber
 * Uses HMAC for stateless validation
 */
export const generateUnsubscribeToken = (email: string): string => {
  const secret = env.UNSUBSCRIBE_HMAC_SECRET || env.SERVICE_TOKEN;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(email.toLowerCase());
  return hmac.digest('base64url');
};

/**
 * Verify unsubscribe token
 */
export const verifyUnsubscribeToken = (email: string, token: string): boolean => {
  const expectedToken = generateUnsubscribeToken(email);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
};

/**
 * Build unsubscribe URL
 */
export const buildUnsubscribeUrl = (email: string, token: string): string => {
  return `${env.APP_URL}/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
};

/**
 * Enqueue a transactional email
 */
export const enqueueTransactionalEmail = async (params: {
  toEmail: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
}): Promise<void> => {
  await DeliveryJob.create({
    type: 'TRANSACTIONAL' as JobType,
    status: 'QUEUED',
    toEmail: params.toEmail.toLowerCase().trim(),
    fromEmail: params.fromEmail || env.FROM_EMAIL,
    subject: params.subject,
    html: params.html,
    text: params.text || null,
    scheduledAt: new Date(),
  });
};

/**
 * Enqueue campaign emails for all subscribed users
 * Batches inserts to avoid memory spikes
 */
export const enqueueCampaignEmails = async (
  campaignId: string,
  subject: string,
  html: string,
  text?: string
): Promise<number> => {
  const BATCH_SIZE = 1000;
  let totalEnqueued = 0;
  let skip = 0;

  while (true) {
    const subscribers = await Subscriber.find({
      status: 'SUBSCRIBED',
    })
      .select('_id email')
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean()
      .exec();

    if (subscribers.length === 0) break;

    // Build jobs for this batch
    const jobs = subscribers.map((subscriber) => {
      const unsubToken = generateUnsubscribeToken(subscriber.email);
      const unsubUrl = buildUnsubscribeUrl(subscriber.email, unsubToken);
      const wrappedHtml = templates.campaignWrapper(html, unsubUrl).html;

      return {
        type: 'CAMPAIGN' as JobType,
        status: 'QUEUED' as const,
        toEmail: subscriber.email,
        fromEmail: env.FROM_EMAIL,
        subject,
        html: wrappedHtml,
        text: text || null,
        campaignId,
        subscriberId: subscriber._id,
        scheduledAt: new Date(),
      };
    });

    // Batch insert
    await DeliveryJob.insertMany(jobs, { ordered: false });
    totalEnqueued += jobs.length;
    skip += BATCH_SIZE;
  }

  return totalEnqueued;
};
