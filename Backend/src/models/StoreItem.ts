import { Schema, model, Types } from "mongoose";
export interface IStoreItem {
  _id: Types.ObjectId;
  classId: Types.ObjectId; // ref Class
  title: string;
  price: number; // in smallest unit
  description?: string | null;
  imageUrl?: string | null;
  stock?: number | null; // null = infinite
  perStudentLimit?: number | null;
  active: boolean;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreItemSchema = new Schema<IStoreItem>(
  {
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    imageUrl: { type: String },
    stock: { type: Number },
    perStudentLimit: { type: Number },
    active: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StoreItemSchema.index({ classId: 1, active: 1, sort: 1 });

export const StoreItem = model<IStoreItem>("StoreItem", StoreItemSchema);
