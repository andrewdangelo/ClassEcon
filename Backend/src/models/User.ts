import { Schema, model, Types } from "mongoose";
import type { Role, UserStatus } from "../utils/enums";

export interface IUser {
  _id: Types.ObjectId;
  role: Role;
  name: string;
  email?: string | null;
  passwordHash?: string; // for auth (JWT)
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// src/models/User.ts
const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["TEACHER", "STUDENT", "PARENT"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true }, // removed unique/sparse here
    passwordHash: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "DISABLED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// keep just this:
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export const User = model<IUser>("User", UserSchema);
