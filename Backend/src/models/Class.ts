import { Schema, model, Types } from "mongoose";

export interface IClass {
  _id: Types.ObjectId;
  classroomId: Types.ObjectId; // ref Classroom
  name: string;
  period?: string | null;
  subject?: string | null;
  slug?: string | null;
  teacherIds: Types.ObjectId[]; // ref User[]
  storeSettings?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;

}

const ClassSchema = new Schema<IClass>(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    period: { type: String },
    subject: { type: String },
    slug: { type: String, unique: true, sparse: true, trim: true },

    teacherIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    storeSettings: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ClassSchema.index({ classroomId: 1 });
ClassSchema.index({ teacherIds: 1 });

export const ClassModel = model<IClass>("Class", ClassSchema);
