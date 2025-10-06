import { Schema, model, Types } from "mongoose";

export interface IPayRequestComment {
  _id: Types.ObjectId;
  payRequestId: Types.ObjectId; // ref PayRequest
  userId: Types.ObjectId; // ref User (author)
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayRequestCommentSchema = new Schema<IPayRequestComment>(
  {
    payRequestId: { type: Schema.Types.ObjectId, ref: "PayRequest", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

PayRequestCommentSchema.index({ payRequestId: 1, createdAt: 1 });

export const PayRequestComment = model<IPayRequestComment>(
  "PayRequestComment",
  PayRequestCommentSchema
);
