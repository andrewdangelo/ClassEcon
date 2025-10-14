import { Schema, model, Types } from "mongoose";

export interface IFine {
  _id: Types.ObjectId;
  studentId: Types.ObjectId; // ref User
  classId: Types.ObjectId; // ref Class
  teacherId: Types.ObjectId; // ref User (teacher who issued the fine)
  amount: number; // fine amount
  reason: string; // required reason for the fine
  description?: string | null; // optional additional details
  transactionId?: Types.ObjectId | null; // ref Transaction (created when fine is issued)
  status: "PENDING" | "APPLIED" | "WAIVED"; // status of the fine
  waivedReason?: string | null; // reason for waiving the fine
  waivedAt?: Date | null;
  waivedByUserId?: Types.ObjectId | null; // ref User
  createdAt: Date;
  updatedAt: Date;
}

const FineSchema = new Schema<IFine>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    status: {
      type: String,
      enum: ["PENDING", "APPLIED", "WAIVED"],
      default: "PENDING",
      required: true,
    },
    waivedReason: { type: String },
    waivedAt: { type: Date },
    waivedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
FineSchema.index({ studentId: 1, classId: 1, createdAt: -1 });
FineSchema.index({ classId: 1, status: 1, createdAt: -1 });
FineSchema.index({ teacherId: 1, classId: 1, createdAt: -1 });

export const Fine = model<IFine>("Fine", FineSchema);
