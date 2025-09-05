import { Schema, model, Types } from "mongoose";

import type { TransactionType } from "../utils/enums";

export interface ITransaction {
  _id: Types.ObjectId;
  accountId: Types.ObjectId; // ref Account
  toAccountId?: Types.ObjectId | null; // ref Account (for transfers)
  classId: Types.ObjectId; // ref Class
  classroomId: Types.ObjectId; // ref Classroom
  type: TransactionType;
  amount: number; // store smallest unit (e.g., cents)
  memo?: string | null;
  createdByUserId: Types.ObjectId; // ref User
  idempotencyKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    toAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "WITHDRAWAL",
        "TRANSFER",
        "ADJUSTMENT",
        "PURCHASE",
        "REFUND",
        "PAYROLL",
        "FINE",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    memo: String,
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idempotencyKey: { type: String }, // removed unique/sparse here
  },
  { timestamps: true }
);

// keep just these:
TransactionSchema.index({ accountId: 1, createdAt: -1 });
TransactionSchema.index({ classId: 1, createdAt: -1 });
TransactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const Transaction = model<ITransaction>(
  "Transaction",
  TransactionSchema
);
