/**
 * SMTP delivery via Nodemailer
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from './env';
import { logger } from './logger';
import type { SendEmailParams, SendEmailResult } from './emailTypes';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!env.SMTP_HOST) {
    throw new Error('SMTP_HOST is not configured');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER !== undefined && env.SMTP_USER !== ''
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? '' }
          : undefined,
      tls: env.SMTP_REJECT_UNAUTHORIZED
        ? undefined
        : { rejectUnauthorized: false },
    });
  }
  return transporter;
};

export const sendViaSmtp = async (params: SendEmailParams): Promise<SendEmailResult> => {
  const fromEmail = params.from || env.FROM_EMAIL;

  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });

    const messageId = typeof info.messageId === 'string' ? info.messageId : undefined;
    logger.debug({ messageId, to: params.to }, 'SMTP email sent');

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error, to: params.to }, 'SMTP send failed');
    return {
      success: false,
      error: errorMessage,
    };
  }
};
