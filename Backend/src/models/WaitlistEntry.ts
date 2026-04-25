import mongoose from "mongoose";

export interface IWaitlistEntry {
  email: string;
  name?: string;
  role?: string;
  school?: string;
  approximateStudents?: string;
  signupOrder: number;
  referralCode: string;
  referredByCode?: string | null;
  successfulReferrals: number;
  boostPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistEntrySchema = new mongoose.Schema<IWaitlistEntry>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    role: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    school: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    approximateStudents: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    signupOrder: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 12,
      index: true,
    },
    referredByCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
      index: true,
    },
    successfulReferrals: {
      type: Number,
      default: 0,
      min: 0,
    },
    boostPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

waitlistEntrySchema.index({ email: 1 }, { unique: true });
waitlistEntrySchema.index({ referralCode: 1 }, { unique: true });
waitlistEntrySchema.index({ signupOrder: 1 }, { unique: true });

export const WaitlistEntry = mongoose.model<IWaitlistEntry>(
  "WaitlistEntry",
  waitlistEntrySchema
);
