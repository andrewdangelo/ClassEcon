import { pickId } from "./helpers";
import { ClassModel, User } from "../models";

export const PayRequest = {
  id: pickId,
  class: (p: any) => ClassModel.findById(p.classId).lean().exec(),
  student: (p: any) => User.findById(p.studentId).lean().exec(),
};
