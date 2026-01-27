/**
 * Subscriber Model
 * Stores email list subscribers with status and tags
 */

import { Schema, model, Document, Types } from 'mongoose';

export type SubscriberStatus = 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'SUPPRESSED';

export interface ISubscriber extends Document {
  _id: Types.ObjectId;
  email: string;
  status: SubscriberStatus;
  tags: string[];
  unsubTokenHash: string | null;
  lastEventAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUBSCRIBED', 'UNSUBSCRIBED', 'SUPPRESSED'],
      default: 'SUBSCRIBED',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    unsubTokenHash: {
      type: String,
      default: null,
    },
    lastEventAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'subscribers',
  }
);

// Indexes
SubscriberSchema.index({ email: 1 }, { unique: true });
SubscriberSchema.index({ status: 1 });
SubscriberSchema.index({ tags: 1 });
SubscriberSchema.index({ createdAt: -1 });

export const Subscriber = model<ISubscriber>('Subscriber', SubscriberSchema);
