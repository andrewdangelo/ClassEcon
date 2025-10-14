import mongoose from "mongoose";

export interface IBetaAccessCode {
  code: string;
  description?: string;
  maxUses: number;
  currentUses: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  usedBy: mongoose.Types.ObjectId[]; // Array of user IDs who used this code
}

const betaAccessCodeSchema = new mongoose.Schema<IBetaAccessCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  maxUses: {
    type: Number,
    required: true,
    default: 1,
  },
  currentUses: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups (code index is already created by unique: true)
betaAccessCodeSchema.index({ isActive: 1 });

export const BetaAccessCode = mongoose.model<IBetaAccessCode>(
  "BetaAccessCode",
  betaAccessCodeSchema
);
