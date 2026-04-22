/**
 * Resend API delivery (optional; use when EMAIL_TRANSPORT=resend or auto without SMTP)
 */

import { Resend } from 'resend';
import { env } from './env';
import { logger } from './logger';
import type { SendEmailParams, SendEmailResult } from './emailTypes';

let resendClient: Resend | null = null;

const getResend = (): Resend => {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
};

export const sendViaResend = async (params: SendEmailParams): Promise<SendEmailResult> => {
  const fromEmail = params.from || env.FROM_EMAIL;

  try {
    const resend = getResend();
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

    logger.debug({ messageId: result.data?.id, to: params.to }, 'Resend email sent');

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error, to: params.to }, 'Resend send failed');
    return {
      success: false,
      error: errorMessage,
    };
  }
};
