import { Schema, model, Types } from "mongoose";


export interface IClassReason {
  _id: Types.ObjectId;
  label: string;
  classId: Types.ObjectId; // ref Class
  createdAt: Date;
  updatedAt: Date;
}

const ClassReasonSchema = new Schema<IClassReason>(
  {
    label: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  },
  { timestamps: true }
);

ClassReasonSchema.index({ classId: 1, label: 1 }, { unique: true });

export const ClassReason = model<IClassReason>(
  "ClassReason",
  ClassReasonSchema
);
