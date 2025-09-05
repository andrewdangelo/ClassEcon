import { Schema, model, Types } from "mongoose";

import type { PayRequestStatus } from "../utils/enums";

export interface IPayRequest {
  _id: Types.ObjectId;
  amount: number;
  reason: string; // free text label (or tie to ClassReason label)
  justification: string;
  status: PayRequestStatus; // SUBMITTED|APPROVED|PAID|REBUKED|DENIED
  teacherComment?: string | null;
  classId: Types.ObjectId; // ref Class
  studentId: Types.ObjectId; // ref User (STUDENT)
  createdAt: Date;
  updatedAt: Date;
}

const PayRequestSchema = new Schema<IPayRequest>(
  {
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    justification: { type: String, required: true },
    status: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "PAID", "REBUKED", "DENIED"],
      default: "SUBMITTED",
    },
    teacherComment: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

PayRequestSchema.index({ classId: 1, studentId: 1, createdAt: -1 });

export const PayRequest = model<IPayRequest>("PayRequest", PayRequestSchema);
