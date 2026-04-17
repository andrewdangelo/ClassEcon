// src/models/Invoice.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  stripeInvoiceId: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  number?: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate?: Date;
  paidAt?: Date;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    stripeInvoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    stripeSubscriptionId: String,
    number: String,
    status: {
      type: String,
      enum: ["draft", "open", "paid", "void", "uncollectible"],
      default: "draft",
    },
    amount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    amountDue: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    periodStart: Date,
    periodEnd: Date,
    dueDate: Date,
    paidAt: Date,
    hostedInvoiceUrl: String,
    invoicePdf: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

export const Invoice = model<IInvoice>("Invoice", InvoiceSchema);
