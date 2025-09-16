// src/models/membership.ts
import type { Role } from "../utils/enums";
import { Schema, model, Types } from "mongoose";

export interface IMembership {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // ref User
  role: Role; // 'TEACHER'|'STUDENT'|'PARENT'
  classIds: Types.ObjectId[]; // refs Class (multi-class support)
  status?: string; // 'ACTIVE'|'INVITED'|'REMOVED'
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["TEACHER", "STUDENT", "PARENT"],
      required: true,
    },
    classIds: {
      type: [Schema.Types.ObjectId],
      ref: "Class",
      default: [],
      index: true,
    },
    status: { type: String, default: "ACTIVE" },
    preferences: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index strategy:
// - One membership doc per (userId, role) (unique). Classes are in classIds array.
// - Cover common lookups by class (array contains) and user.
MembershipSchema.index({ userId: 1, role: 1 }, { unique: true });
MembershipSchema.index({ classIds: 1, role: 1 }); // array-contains + role
MembershipSchema.index({ userId: 1 });

export const Membership = model<IMembership>("Membership", MembershipSchema);
