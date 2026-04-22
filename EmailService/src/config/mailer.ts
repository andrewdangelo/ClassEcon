/**
 * Unified outbound email: SMTP or Resend based on EMAIL_TRANSPORT / env.
 */

import { getMailTransport } from './env';
import { sendViaResend } from './resend';
import { sendViaSmtp } from './smtp';
import type { SendEmailParams, SendEmailResult } from './emailTypes';

export type { SendEmailParams, SendEmailResult } from './emailTypes';

export const sendEmail = async (params: SendEmailParams): Promise<SendEmailResult> => {
  const transport = getMailTransport();
  if (transport === 'smtp') {
    return sendViaSmtp(params);
  }
  return sendViaResend(params);
};

export const sendBatchEmails = async (
  emails: SendEmailParams[]
): Promise<SendEmailResult[]> => {
  const results: SendEmailResult[] = [];
  for (const email of emails) {
    results.push(await sendEmail(email));
  }
  return results;
};
