import { Types } from "mongoose";
import { Membership } from "../models/Membership";

export async function addUserToClassByRole(
  userId: string | Types.ObjectId,
  role: "TEACHER" | "STUDENT" | "PARENT",
  classId: string | Types.ObjectId
) {
  await Membership.updateOne(
    { userId: new Types.ObjectId(userId), role },
    {
      $setOnInsert: { status: "ACTIVE" },
      $addToSet: { classIds: new Types.ObjectId(classId) },
    },
    { upsert: true }
  ).exec();
}

export async function removeUserFromClassByRole(
  userId: string | Types.ObjectId,
  role: "TEACHER" | "STUDENT" | "PARENT",
  classId: string | Types.ObjectId
) {
  await Membership.updateOne(
    { userId: new Types.ObjectId(userId), role },
    { $pull: { classIds: new Types.ObjectId(classId) } }
  ).exec();
}
