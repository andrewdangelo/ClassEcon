/**
 * WebhookEvent Model
 * Stores raw webhook events from Resend for audit and debugging
 */

import { Schema, model, Document, Types } from 'mongoose';

export interface IWebhookEvent extends Document {
  _id: Types.ObjectId;
  provider: string;
  eventType: string;
  providerMessageId: string | null;
  payload: Record<string, unknown>;
  receivedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: {
      type: String,
      required: true,
      default: 'resend',
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    providerMessageId: {
      type: String,
      default: null,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'webhook_events',
  }
);

// Indexes
WebhookEventSchema.index({ providerMessageId: 1 });
WebhookEventSchema.index({ receivedAt: -1 });
WebhookEventSchema.index({ eventType: 1, receivedAt: -1 });

export const WebhookEvent = model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
