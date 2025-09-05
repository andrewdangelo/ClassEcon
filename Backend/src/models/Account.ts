import { Schema, model, Types } from "mongoose";


export interface IAccount {
  _id: Types.ObjectId;
  studentId: Types.ObjectId; // ref User (role STUDENT)
  classId: Types.ObjectId; // ref Class
  classroomId: Types.ObjectId; // denorm ref Classroom
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
  },
  { timestamps: true }
);

AccountSchema.index({ studentId: 1, classId: 1 }, { unique: true });
AccountSchema.index({ classId: 1 });
AccountSchema.index({ studentId: 1 });

export const Account = model<IAccount>("Account", AccountSchema);
