import { Schema, model, Types } from "mongoose";

export interface IAuditLog {
  _id: Types.ObjectId;
  adminUserId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId: Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    details: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes for efficient querying
AuditLogSchema.index({ adminUserId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
