import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // User who will receive the notification
  type: string; // e.g., "PAY_REQUEST_SUBMITTED", "PAY_REQUEST_APPROVED", "PAY_REQUEST_DENIED", etc.
  title: string;
  message: string;
  relatedId?: Types.ObjectId; // ID of related entity (e.g., payRequestId)
  relatedType?: string; // Type of related entity (e.g., "PayRequest", "Transaction")
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    relatedType: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
