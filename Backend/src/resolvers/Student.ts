import { ClassModel, Account, Transaction, PayRequest } from "../models";

export const Student = {
  class: (p: any) => ClassModel.findById(p.classId).lean().exec(),
  txns: async (p: any) => {
    const acct = await Account.findOne({
      studentId: p.id,
      classId: p.classId,
    }).lean();
    if (!acct) return [];
    return Transaction.find({ accountId: acct._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },
  requests: (p: any) =>
    PayRequest.find({ studentId: p.id, classId: p.classId })
      .sort({ createdAt: -1 })
      .lean()
      .exec(),
};
