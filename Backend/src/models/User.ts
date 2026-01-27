import { Schema, model, Types } from "mongoose";
import type { Role, UserStatus, SubscriptionTier, SubscriptionStatus } from "../utils/enums";

export interface IUser {
  _id: Types.ObjectId;
  role: Role;
  name: string;
  email?: string | null;
  passwordHash?: string; // for auth (JWT)
  status: UserStatus;
  oauthProvider?: "google" | "microsoft" | null;
  oauthProviderId?: string | null;
  profilePicture?: string | null;
  hasBetaAccess: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Date | null;
  trialStartedAt?: Date | null;
  trialEndsAt?: Date | null;
  isFoundingMember: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// src/models/User.ts
const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true }, // removed unique/sparse here
    passwordHash: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "DISABLED", "BANNED"],
      default: "ACTIVE",
    },
    oauthProvider: { type: String, enum: ["google", "microsoft"], default: null },
    oauthProviderId: { type: String, default: null },
    profilePicture: { type: String, default: null },
    hasBetaAccess: { type: Boolean, default: false },
    subscriptionTier: {
      type: String,
      enum: ["FREE", "TRIAL", "STARTER", "PROFESSIONAL", "SCHOOL"],
      default: "FREE",
    },
    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "TRIAL", "EXPIRED", "CANCELED", "PAST_DUE"],
      default: "ACTIVE",
    },
    subscriptionExpiresAt: { type: Date, default: null },
    trialStartedAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
    isFoundingMember: { type: Boolean, default: false },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
  },
  { timestamps: true }
);

// keep just this:
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export const User = model<IUser>("User", UserSchema);
