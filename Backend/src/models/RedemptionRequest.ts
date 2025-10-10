import { Schema, model, Types } from "mongoose";

export interface IRedemptionRequest {
  _id: Types.ObjectId;
  purchaseId: Types.ObjectId; // ref Purchase
  studentId: Types.ObjectId; // ref User
  classId: Types.ObjectId; // ref Class
  status: "pending" | "approved" | "denied";
  studentNote?: string | null; // Optional note from student about what they want to use it for
  teacherComment?: string | null; // Teacher's comment on approval/denial
  reviewedByUserId?: Types.ObjectId | null; // ref User (teacher who reviewed)
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RedemptionRequestSchema = new Schema<IRedemptionRequest>(
  {
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
      required: true,
      index: true,
    },
    studentNote: { type: String, default: null },
    teacherComment: { type: String, default: null },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
RedemptionRequestSchema.index({ classId: 1, status: 1, createdAt: -1 });
RedemptionRequestSchema.index({ studentId: 1, status: 1, createdAt: -1 });

export const RedemptionRequest = model<IRedemptionRequest>(
  "RedemptionRequest",
  RedemptionRequestSchema
);
