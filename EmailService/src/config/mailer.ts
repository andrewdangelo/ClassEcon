/**
 * Unified outbound email via SMTP.
 */

import { sendViaSmtp } from './smtp';
import type { SendEmailParams, SendEmailResult } from './emailTypes';

export type { SendEmailParams, SendEmailResult } from './emailTypes';

export const sendEmail = async (params: SendEmailParams): Promise<SendEmailResult> => {
  return sendViaSmtp(params);
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
