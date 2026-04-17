// src/models/PaymentEvent.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IPaymentEvent extends Document {
  _id: Types.ObjectId;
  stripeEventId: string;
  eventType: string;
  userId?: string;
  customerId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  amount?: number;
  currency?: string;
  status: "pending" | "processed" | "failed";
  metadata?: Record<string, any>;
  error?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentEventSchema = new Schema<IPaymentEvent>(
  {
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    customerId: {
      type: String,
      index: true,
    },
    subscriptionId: {
      type: String,
      index: true,
    },
    invoiceId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentEvent = model<IPaymentEvent>("PaymentEvent", PaymentEventSchema);
