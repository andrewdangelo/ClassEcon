/**
 * Resend Client Wrapper
 * Provides typed interface to Resend SDK
 */

import { Resend } from 'resend';
import { env } from './env';
import { logger } from './logger';

// Initialize Resend client
export const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via Resend
 */
export const sendEmail = async (params: SendEmailParams): Promise<SendEmailResult> => {
  const fromEmail = params.from || env.FROM_EMAIL;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      tags: params.tags,
    });

    if (result.error) {
      logger.error({ error: result.error, to: params.to }, 'Resend API error');
      return {
        success: false,
        error: result.error.message,
      };
    }

    logger.debug({ messageId: result.data?.id, to: params.to }, 'Email sent successfully');

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error, to: params.to }, 'Failed to send email');
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Batch send emails (for bulk operations)
 * Note: Resend has rate limits, so this should be called carefully
 */
export const sendBatchEmails = async (
  emails: SendEmailParams[]
): Promise<SendEmailResult[]> => {
  const results: SendEmailResult[] = [];

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
  }

  return results;
};
