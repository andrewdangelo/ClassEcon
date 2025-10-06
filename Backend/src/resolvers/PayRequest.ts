import { pickId } from "./helpers";
import { ClassModel, User, PayRequestComment } from "../models";

export const PayRequest = {
  id: pickId,
  class: (p: any) => ClassModel.findById(p.classId).lean().exec(),
  student: (p: any) => User.findById(p.studentId).lean().exec(),
  comments: (p: any) => PayRequestComment.find({ payRequestId: p._id }).sort({ createdAt: 1 }).lean().exec(),
};
