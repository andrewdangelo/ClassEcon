import type { PayPeriod, JobSalaryUnit } from "../utils/enums";
import { Schema, model, Types } from "mongoose";

export interface IJob {
  _id: Types.ObjectId;
  classId: Types.ObjectId; // ref Class
  title: string;
  description?: string | null;
  salary: { amount: number; unit: JobSalaryUnit };
  period: PayPeriod; // WEEKLY|BIWEEKLY|MONTHLY|SEMESTER
  schedule?: {
    weekday?: number;
    dayOfMonth?: number;
    anchorDate?: Date;
  } | null;
  capacity: { current: number; max: number };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    salary: {
      amount: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ["FIXED", "HOURLY"], default: "FIXED" },
    },
    period: {
      type: String,
      enum: ["WEEKLY", "BIWEEKLY", "MONTHLY", "SEMESTER"],
      required: true,
    },
    schedule: {
      weekday: { type: Number, min: 0, max: 6 },
      dayOfMonth: { type: Number, min: 1, max: 31 },
      anchorDate: { type: Date },
    },
    capacity: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 1 },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

JobSchema.index({ classId: 1, active: 1 });

export const Job = model<IJob>("Job", JobSchema);
