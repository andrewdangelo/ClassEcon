import { Schema, model, Document, Types } from "mongoose";

export enum PlanTier {
  FREE_TRIAL = "FREE_TRIAL",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

export enum PlanStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  TRIAL = "TRIAL",
}

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planTier: PlanTier;
  status: PlanStatus;
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  features: string[];
  limits: {
    maxClasses: number;
    maxStudentsPerClass: number;
    maxStoreItems: number;
    maxJobs: number;
    customCurrency: boolean;
    analytics: boolean;
    exportData: boolean;
    prioritySupport: boolean;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    planTier: {
      type: String,
      enum: Object.values(PlanTier),
      default: PlanTier.FREE_TRIAL,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PlanStatus),
      default: PlanStatus.TRIAL,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
      // 14 day free trial by default
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    features: [{ type: String }],
    limits: {
      maxClasses: { type: Number, required: true },
      maxStudentsPerClass: { type: Number, required: true },
      maxStoreItems: { type: Number, required: true },
      maxJobs: { type: Number, required: true },
      customCurrency: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      exportData: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient lookups
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ planTier: 1 });

export const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);
