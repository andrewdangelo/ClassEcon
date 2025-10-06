import {
  Classroom,
  Membership,
  User,
  Account,
  Transaction,
  StoreItem,
  Job,
  PayRequest,
  ClassReason,
} from "../models";
import { pickId } from "./helpers";

export const Class = {
  id: pickId,

  defaultCurrency: async (p: any) => {
    const classroom = await Classroom.findById(p.classroomId).lean().exec();
    return classroom?.settings?.currency ?? "CE$";
  },

  students: async (p: any) => {
    const memberships = await Membership.find({
      classIds: p._id,
      role: "STUDENT",
    })
      .lean()
      .exec();
    if (!memberships.length) return [];

    const users = await User.find({
      _id: { $in: memberships.map((m) => m.userId) },
    })
      .lean()
      .exec();

    return users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      classId: p._id.toString(),
      balance: 0, // compute balance if needed
    }));
  },

  storeItems: (p: any) => StoreItem.find({ classId: p._id }).lean().exec(),
  jobs: (p: any) => Job.find({ classId: p._id }).lean().exec(),
  transactions: (p: any) =>
    Transaction.find({ classId: p._id }).sort({ createdAt: -1 }).lean().exec(),
  payRequests: (p: any) =>
    PayRequest.find({ classId: p._id }).sort({ createdAt: -1 }).lean().exec(),
  reasons: (p: any) =>
    ClassReason.find({ classId: p._id }).sort({ label: 1 }).lean().exec(),
};
