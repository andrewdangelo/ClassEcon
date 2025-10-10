import { Schema, model, Types } from "mongoose";

export interface IPurchase {
  _id: Types.ObjectId;
  itemId?: string; // Unique identifier for this specific purchase instance (for auditing)
  studentId: Types.ObjectId; // ref User
  classId: Types.ObjectId; // ref Class
  accountId: Types.ObjectId; // ref Account
  storeItemId: Types.ObjectId; // ref StoreItem
  quantity: number;
  unitPrice: number; // snapshot at purchase time
  total: number; // quantity * unitPrice
  status: "in-backpack" | "redeemed" | "expired"; // Tracks item lifecycle
  redemptionDate?: Date | null;
  redemptionNote?: string | null; // What the item was used for
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    itemId: { 
      type: String, 
      required: false,
      unique: true,
      sparse: true, // Allow multiple null values (for legacy data)
      index: true,
      default: () => `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
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
    status: {
      type: String,
      enum: ["in-backpack", "redeemed", "expired"],
      default: "in-backpack",
      required: true,
      index: true,
    },
    redemptionDate: { type: Date, default: null },
    redemptionNote: { type: String, default: null },
  },
  { timestamps: true }
);

PurchaseSchema.index({ studentId: 1, classId: 1, createdAt: -1 });
PurchaseSchema.index({ storeItemId: 1 });

export const Purchase = model<IPurchase>("Purchase", PurchaseSchema);
