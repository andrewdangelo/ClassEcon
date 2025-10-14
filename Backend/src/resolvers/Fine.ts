import { User, ClassModel, Transaction } from "../models";

export const Fine = {
  student: (p: any) => User.findById(p.studentId).lean().exec(),
  class: (p: any) => ClassModel.findById(p.classId).lean().exec(),
  teacher: (p: any) => User.findById(p.teacherId).lean().exec(),
  transaction: (p: any) => {
    if (!p.transactionId) return null;
    return Transaction.findById(p.transactionId).lean().exec();
  },
  waivedBy: (p: any) => {
    if (!p.waivedByUserId) return null;
    return User.findById(p.waivedByUserId).lean().exec();
  },
};
