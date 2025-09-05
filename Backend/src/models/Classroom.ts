import { Schema, model, Types } from "mongoose";

export interface IClassroom {
  _id: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId; // ref User
  settings: {
    currency?: string; // default "CE$"
    overdraft?: number; // allowed negative balance limit
    transferAcrossClasses?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    settings: {
      currency: { type: String, default: "CE$" },
      overdraft: { type: Number, default: 0 },
      transferAcrossClasses: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

ClassroomSchema.index({ ownerId: 1 });

export const Classroom = model<IClassroom>("Classroom", ClassroomSchema);
