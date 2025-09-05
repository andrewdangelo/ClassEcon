import { Schema, model, Types } from "mongoose";

export interface IPurchase {
  _id: Types.ObjectId;
  studentId: Types.ObjectId; // ref User
  classId: Types.ObjectId; // ref Class
  accountId: Types.ObjectId; // ref Account
  storeItemId: Types.ObjectId; // ref StoreItem
  quantity: number;
  unitPrice: number; // snapshot at purchase time
  total: number; // quantity * unitPrice
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    storeItemId: {
      type: Schema.Types.ObjectId,
      ref: "StoreItem",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

PurchaseSchema.index({ studentId: 1, classId: 1, createdAt: -1 });
PurchaseSchema.index({ storeItemId: 1 });

export const Purchase = model<IPurchase>("Purchase", PurchaseSchema);
