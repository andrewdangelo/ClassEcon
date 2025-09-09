// src/graphql/models/class.model.ts (or wherever your ClassSchema lives)
import { Schema, model, Types } from "mongoose";

export type PayPeriod = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "SEMESTER";

export interface IClass {
  _id: Types.ObjectId;
  classroomId: Types.ObjectId; // ref Classroom
  name: string;
  subject?: string | null;
  period?: string | null;
  gradeLevel?: number | null;

  // Enrollment & access
  joinCode: string; // unique auto-generated

  // Context / grouping (optional)
  schoolName?: string | null;
  district?: string | null;

  // Economy defaults
  payPeriodDefault?: PayPeriod | null;
  startingBalance?: number | null; // applied to new students on join

  // Ownership & config
  slug?: string | null; // unique (only when non-empty)
  teacherIds: Types.ObjectId[]; // ref User[]
  storeSettings?: Record<string, unknown> | null;

  // Lifecycle
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

function genJoinCode(len = 6) {
  // Uppercase letters & digits; avoids ambiguous chars
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += alphabet[(Math.random() * alphabet.length) | 0];
  return out;
}

const ClassSchema = new Schema<IClass>(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    period: { type: String, trim: true },
    gradeLevel: { type: Number, min: 0, max: 12 },

    // unique join code
    joinCode: { type: String, required: true, unique: true, index: true },

    schoolName: { type: String, trim: true },
    district: { type: String, trim: true },

    payPeriodDefault: {
      type: String,
      enum: ["WEEKLY", "BIWEEKLY", "MONTHLY", "SEMESTER"],
    },
    startingBalance: { type: Number, min: 0 },

    // IMPORTANT: do NOT set unique here; we enforce uniqueness via a partial index below.
    // Also normalize empty strings to "unset" so they don't hit the unique index.
    slug: {
      type: String,
      trim: true,
      set: (v: unknown) => {
        if (typeof v !== "string") return undefined;
        const t = v.trim();
        return t.length ? t : undefined; // undefined => field absent
      },
    },

    teacherIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    storeSettings: { type: Schema.Types.Mixed },

    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Ensure joinCode exists (basic; collisions are extremely unlikely but still enforced by unique index)
ClassSchema.pre("validate", function (next) {
  if (!this.joinCode) this.joinCode = genJoinCode();
  next();
});

// Indexes
ClassSchema.index({ classroomId: 1 });
// Partial unique: only enforce uniqueness when slug is a non-empty string
ClassSchema.index(
  { slug: 1 },
  {
    name: "slug_unique_nonempty",
    unique: true,
    partialFilterExpression: { slug: { $type: "string", $ne: "" } },
  }
);

export const ClassModel = model<IClass>("Class", ClassSchema);
