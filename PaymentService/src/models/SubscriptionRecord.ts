// src/models/SubscriptionRecord.ts
import { Schema, model, Document, Types } from "mongoose";

export type SubscriptionTier = "FREE" | "TRIAL" | "STARTER" | "PROFESSIONAL" | "SCHOOL";
export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELED" | "EXPIRED";
export type BillingInterval = "monthly" | "yearly";

export interface ISubscriptionRecord extends Document {
  _id: Types.ObjectId;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  isFoundingMember: boolean;
  discountPercent?: number;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionRecordSchema = new Schema<ISubscriptionRecord>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["FREE", "TRIAL", "STARTER", "PROFESSIONAL", "SCHOOL"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "TRIAL", "PAST_DUE", "CANCELED", "EXPIRED"],
      default: "TRIAL",
    },
    billingInterval: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialStart: Date,
    trialEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: Date,
    isFoundingMember: {
      type: Boolean,
      default: false,
    },
    discountPercent: Number,
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    paymentMethodId: String,
    paymentMethodLast4: String,
    paymentMethodBrand: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Index for finding by user
SubscriptionRecordSchema.index({ userId: 1, status: 1 });

export const SubscriptionRecord = model<ISubscriptionRecord>(
  "SubscriptionRecord",
  SubscriptionRecordSchema
);
