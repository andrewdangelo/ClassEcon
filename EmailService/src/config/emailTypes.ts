/**
 * Shared types for email delivery (SMTP, Resend, etc.)
 */

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
