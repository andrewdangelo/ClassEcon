/**
 * DeliveryJob Model
 * Queue for email delivery with retry support
 */

import { Schema, model, Document, Types } from 'mongoose';

export type JobType = 'TRANSACTIONAL' | 'CAMPAIGN';
export type JobStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED' | 'RETRY';

export interface IDeliveryJob extends Document {
  _id: Types.ObjectId;
  type: JobType;
  status: JobStatus;
  toEmail: string;
  fromEmail: string;
  subject: string;
  html: string;
  text: string | null;
  campaignId: Types.ObjectId | null;
  subscriberId: Types.ObjectId | null;
  providerMessageId: string | null;
  attempts: number;
  lastError: string | null;
  scheduledAt: Date;
  sentAt: Date | null;
  lockedAt: Date | null;
  lockedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryJobSchema = new Schema<IDeliveryJob>(
  {
    type: {
      type: String,
      enum: ['TRANSACTIONAL', 'CAMPAIGN'],
      required: true,
    },
    status: {
      type: String,
      enum: ['QUEUED', 'SENDING', 'SENT', 'FAILED', 'RETRY'],
      default: 'QUEUED',
      index: true,
    },
    toEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fromEmail: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
      index: true,
    },
    subscriberId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscriber',
      default: null,
    },
    providerMessageId: {
      type: String,
      default: null,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
    scheduledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    // Locking for worker concurrency
    lockedAt: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'delivery_jobs',
  }
);

// CRITICAL indexes for worker correctness
DeliveryJobSchema.index({ status: 1, scheduledAt: 1 });
DeliveryJobSchema.index({ providerMessageId: 1 });
DeliveryJobSchema.index({ campaignId: 1 });
DeliveryJobSchema.index({ toEmail: 1 });
DeliveryJobSchema.index({ lockedAt: 1 }); // For lock timeout recovery
DeliveryJobSchema.index({ createdAt: -1 });

export const DeliveryJob = model<IDeliveryJob>('DeliveryJob', DeliveryJobSchema);
