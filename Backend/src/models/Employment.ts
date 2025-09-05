import { Schema, model, Types } from "mongoose";

import type { EmploymentStatus } from "../utils/enums";

export interface IEmployment {
  _id: Types.ObjectId;
  jobId: Types.ObjectId; // ref Job
  classId: Types.ObjectId; // ref Class (denorm)
  studentId: Types.ObjectId; // ref User
  status: EmploymentStatus;
  startedAt: Date;
  endedAt?: Date | null;
  lastPaidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmploymentSchema = new Schema<IEmployment>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["ACTIVE", "ENDED"], default: "ACTIVE" },
    startedAt: { type: Date, default: () => new Date() },
    endedAt: { type: Date },
    lastPaidAt: { type: Date },
  },
  { timestamps: true }
);

EmploymentSchema.index({ classId: 1, studentId: 1, status: 1 });
EmploymentSchema.index({ jobId: 1, status: 1 });

export const Employment = model<IEmployment>("Employment", EmploymentSchema);
