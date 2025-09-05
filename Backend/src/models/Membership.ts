import type { Role } from "../utils/enums";
import { Schema, model, Types } from "mongoose";

export interface IMembership {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // ref User
  classId: Types.ObjectId; // ref Class
  role: Role; // 'TEACHER'|'STUDENT'|'PARENT'
  status?: string; // e.g., 'ACTIVE'|'INVITED'|'REMOVED'
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    role: {
      type: String,
      enum: ["TEACHER", "STUDENT", "PARENT"],
      required: true,
    },
    status: { type: String, default: "ACTIVE" },
    preferences: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

MembershipSchema.index({ userId: 1 });
MembershipSchema.index({ classId: 1, role: 1 });
MembershipSchema.index({ userId: 1, classId: 1, role: 1 }, { unique: true });

export const Membership = model<IMembership>("Membership", MembershipSchema);
