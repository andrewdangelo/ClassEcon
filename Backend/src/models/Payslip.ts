import { Schema, model, Types } from "mongoose";

export interface IPayslip {
  _id: Types.ObjectId;
  employmentId: Types.ObjectId; // ref Employment
  jobId: Types.ObjectId; // ref Job
  classId: Types.ObjectId; // ref Class
  studentId: Types.ObjectId; // ref User
  periodStart: Date;
  periodEnd: Date;
  gross: number; // amount in smallest unit
  postedTxId?: Types.ObjectId | null; // ref Transaction
  createdAt: Date;
  updatedAt: Date;
}

const PayslipSchema = new Schema<IPayslip>(
  {
    employmentId: {
      type: Schema.Types.ObjectId,
      ref: "Employment",
      required: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    gross: { type: Number, required: true, min: 0 },
    postedTxId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { timestamps: true }
);

PayslipSchema.index({ employmentId: 1, periodEnd: -1 });
PayslipSchema.index({ classId: 1, studentId: 1, periodEnd: -1 });

export const Payslip = model<IPayslip>("Payslip", PayslipSchema);
