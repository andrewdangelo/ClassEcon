import { Schema, model, Types } from "mongoose";
import type { JobApplicationStatus } from "../utils/enums";


export interface IJobApplication {
_id: Types.ObjectId;
jobId: Types.ObjectId; // ref Job
classId: Types.ObjectId; // ref Class (denorm for queries)
studentId: Types.ObjectId; // ref User
status: JobApplicationStatus;
createdAt: Date;
decidedAt?: Date | null;
updatedAt: Date;
}


const JobApplicationSchema = new Schema<IJobApplication>(
{
jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"], default: "PENDING" },
decidedAt: { type: Date },
},
{ timestamps: true }
);


JobApplicationSchema.index({ jobId: 1, status: 1 });
JobApplicationSchema.index({ classId: 1, studentId: 1, status: 1 });


export const JobApplication = model<IJobApplication>("JobApplication", JobApplicationSchema);