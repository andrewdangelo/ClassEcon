/**
 * Resend Webhook Handler
 * Processes delivery events and handles bounces/complaints
 */

import { Request, Response, Router, IRouter } from 'express';
import crypto from 'crypto';
import { DeliveryJob, WebhookEvent, Subscriber } from '../models';
import { env, webhookLogger } from '../config';

export const webhookRouter: IRouter = Router();

/**
 * Verify webhook signature (constant-time comparison)
 */
const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
};

/**
 * Resend webhook event types
 */
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at?: string;
    // Bounce-specific
    bounce?: {
      message: string;
    };
    // Complaint-specific
    complaint?: {
      message: string;
    };
  };
}

/**
 * Handle Resend webhook events
 */
webhookRouter.post('/resend', async (req: Request, res: Response) => {
  try {
    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-webhook-signature'] as string || req.headers['webhook-signature'] as string;

    // Verify signature if provided
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      webhookLogger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // If no signature, check for webhook secret header as fallback
    const secretHeader = req.headers['x-webhook-secret'] as string;
    if (!signature && secretHeader !== env.WEBHOOK_SECRET) {
      webhookLogger.warn('Missing or invalid webhook authentication');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = req.body as ResendWebhookPayload;

    webhookLogger.debug(
      { type: payload.type, emailId: payload.data?.email_id },
      'Received webhook event'
    );

    // Store the raw event
    await WebhookEvent.create({
      provider: 'resend',
      eventType: payload.type,
      providerMessageId: payload.data?.email_id,
      payload: payload,
      receivedAt: new Date(),
    });

    // Process the event
    await processWebhookEvent(payload);

    return res.status(200).json({ received: true });
  } catch (error) {
    webhookLogger.error({ error }, 'Webhook processing error');
    // Return 200 to prevent retries for processing errors
    return res.status(200).json({ received: true, error: 'Processing error' });
  }
});

/**
 * Process a webhook event
 */
const processWebhookEvent = async (payload: ResendWebhookPayload): Promise<void> => {
  const { type, data } = payload;
  const messageId = data.email_id;
  const toEmails = data.to || [];

  // Find the delivery job by provider message ID
  const job = messageId
    ? await DeliveryJob.findOne({ providerMessageId: messageId }).exec()
    : null;

  switch (type) {
    case 'email.delivered':
      if (job) {
        await DeliveryJob.updateOne(
          { _id: job._id },
          { $set: { status: 'SENT' } }
        );
        webhookLogger.info({ messageId }, 'Email delivered');
      }
      break;

    case 'email.bounced':
      webhookLogger.warn(
        { messageId, toEmails, bounce: data.bounce },
        'Email bounced'
      );

      // Mark subscribers as SUPPRESSED
      for (const email of toEmails) {
        await suppressSubscriber(email, 'bounce');
      }

      // Update job status if found
      if (job) {
        await DeliveryJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'FAILED',
              lastError: `Bounced: ${data.bounce?.message || 'Unknown'}`,
            },
          }
        );
      }
      break;

    case 'email.complained':
      webhookLogger.warn(
        { messageId, toEmails },
        'Email complaint received'
      );

      // Mark subscribers as SUPPRESSED - complaints are serious
      for (const email of toEmails) {
        await suppressSubscriber(email, 'complaint');
      }

      // Update job if found
      if (job) {
        await DeliveryJob.updateOne(
          { _id: job._id },
          {
            $set: {
              lastError: `Complaint: ${data.complaint?.message || 'Spam complaint'}`,
            },
          }
        );
      }
      break;

    case 'email.delivery_delayed':
      webhookLogger.info({ messageId }, 'Email delivery delayed');
      // Optionally track delays
      break;

    case 'email.opened':
    case 'email.clicked':
      // Track engagement if needed
      webhookLogger.debug({ messageId, type }, 'Engagement event');
      break;

    default:
      webhookLogger.debug({ type }, 'Unhandled webhook event type');
  }
};

/**
 * Suppress a subscriber due to bounce/complaint
 */
const suppressSubscriber = async (
  email: string,
  reason: 'bounce' | 'complaint'
): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim();

  const result = await Subscriber.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        status: 'SUPPRESSED',
        lastEventAt: new Date(),
      },
    }
  );

  if (result.modifiedCount > 0) {
    webhookLogger.info(
      { email: normalizedEmail, reason },
      'Subscriber suppressed'
    );
  }
};
