/**
 * Campaign Model
 * Stores email campaigns with status tracking
 */

import { Schema, model, Document, Types } from 'mongoose';

export type CampaignStatus = 'DRAFT' | 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED';

export interface ICampaign extends Document {
  _id: Types.ObjectId;
  name: string | null;
  subject: string;
  html: string;
  text: string | null;
  status: CampaignStatus;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      default: null,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED'],
      default: 'DRAFT',
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'campaigns',
  }
);

// Indexes
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ createdAt: -1 });

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);
