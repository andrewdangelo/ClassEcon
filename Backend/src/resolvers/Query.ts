import {
  User,
  Classroom,
  ClassModel,
  Membership,
  Transaction,
  StoreItem,
  PayRequest,
  ClassReason,
  Account,
  IClass,
  IMembership,
  IUser,
} from "../models";
import { Role } from "../utils/enums";
import {
  toId,
  requireAuth,
  requireTeacher,
  requireClassTeacher,
  assertAccountAccess,
  assertSelfOrTeacherForStudent,
  Ctx,
} from "./helpers";
import { Types } from "mongoose";

export const Query = {
  classes: (
    _: any,
    { includeArchived = false }: { includeArchived?: boolean }
  ) =>
    ClassModel.find(includeArchived ? {} : { isArchived: false })
      .lean()
      .exec(),

  classrooms: () => Classroom.find({}).lean().exec(),

  classroom: (_: any, { id }: { id: string }) =>
    Classroom.findById(id).lean().exec(),

  class: (_: any, { id, slug }: { id?: string; slug?: string }) => {
    if (id) return ClassModel.findById(id).lean().exec();
    if (slug) return ClassModel.findOne({ slug }).lean().exec();
    return null;
  },

  membershipsByClass: async (_: any, { classId, role }: any, ctx: any) => {
    await requireClassTeacher(ctx, classId);
    return Membership.find({
      classIds: toId(classId),
      ...(role ? { role } : {}),
    })
      .lean()
      .exec();
  },

  account: async (_: any, { studentId, classId }: any, ctx: any) => {
    await assertSelfOrTeacherForStudent(ctx, studentId);
    const acct =
      (await Account.findOne({
        studentId: toId(studentId),
        classId: toId(classId),
      }).lean()) ??
      (await Account.create({
        studentId: toId(studentId),
        classId: toId(classId),
      }).then((a) => a.toObject()));
    const balance = await Transaction.aggregate([
      { $match: { accountId: acct._id } },
      { $group: { _id: "$accountId", balance: { $sum: "$amount" } } },
    ]).exec();
    return {
      ...acct,
      id: acct._id.toString(),
      balance: balance[0]?.balance ?? 0,
    };
  },

  storeItemsByClass: (_: any, { classId }: any) =>
    StoreItem.find({ classId }).lean().exec(),

  payRequestsByClass: async (_: any, { classId, status }: any, ctx: any) => {
    await requireClassTeacher(ctx, classId);
    return PayRequest.find({ classId, ...(status ? { status } : {}) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  payRequestsByStudent: async (
    _: any,
    { classId, studentId }: any,
    ctx: any
  ) => {
    await assertSelfOrTeacherForStudent(ctx, studentId);
    return PayRequest.find({ classId, studentId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  reasonsByClass: async (_: any, { classId }: any, ctx: any) => {
    await requireClassTeacher(ctx, classId);
    return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
  },

  transactionsByAccount: async (_: any, { accountId }: any, ctx: any) => {
    await assertAccountAccess(ctx, accountId);
    return Transaction.find({ accountId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  me: (_: any, __: any, ctx: any) =>
    ctx.userId ? User.findById(ctx.userId).lean().exec() : null,

  classesByUser: async (
    _: any,
    {
      userId,
      role,
      includeArchived = false,
    }: { userId: string; role?: Role; includeArchived?: boolean },
    ctx: Ctx
  ) => {
    //TEMP DEBUG
    /* requireAuthLocal(ctx);
        if (ctx.userId !== userId && ctx.role !== "TEACHER") {
          throw new GraphQLError("Forbidden");
        } */

    const memberships = await Membership.find({
      userId: toId(userId),
      ...(role ? { role } : {}),
      // ensure we only consider docs that actually have classes
      classIds: { $exists: true, $ne: [] },
    })
      .lean<IMembership[]>()
      .exec();

    const classIdObjs = Array.from(
      new Set(
        memberships.flatMap((m) =>
          (m.classIds ?? []).filter(Boolean).map((cid: any) => cid.toString())
        )
      )
    ).map((s) => new Types.ObjectId(s));

    if (!classIdObjs.length) return [];

    return ClassModel.find({
      _id: { $in: classIdObjs },
      ...(includeArchived ? {} : { isArchived: false }),
    })
      .lean<IClass[]>()
      .exec();
  },

  myClasses: async (
    _: any,
    {
      role,
      includeArchived = false,
    }: { role?: Role; includeArchived?: boolean },
    ctx: Ctx
  ) => {
    requireAuth(ctx);
    const userId = ctx.userId!;

    const memberships = await Membership.find({
      userId: toId(userId),
      ...(role ? { role } : {}),
      classIds: { $exists: true, $ne: [] },
    })
      .lean<IMembership[]>()
      .exec();

    const classIdObjs = Array.from(
      new Set(
        memberships.flatMap((m) =>
          (m.classIds ?? []).filter(Boolean).map((cid: any) => cid.toString())
        )
      )
    ).map((s) => new Types.ObjectId(s));

    if (!classIdObjs.length) return [];

    return ClassModel.find({
      _id: { $in: classIdObjs },
      ...(includeArchived ? {} : { isArchived: false }),
    })
      .lean<IClass[]>()
      .exec();
  },

  students: async (
    _: any,
    args: {
      filter?: { classId?: string; search?: string; status?: string };
      limit?: number;
      offset?: number;
    },
    ctx: Ctx
  ) => {
    requireTeacher(ctx);

    const { filter, limit = 50, offset = 0 } = args;
    const { classId, search, status } = filter ?? {};

    const query: any = { role: "STUDENT" };
    if (status) query.status = status;

    if (search?.trim()) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [{ name: rx }, { email: rx }];
    }

    if (classId) {
      const userIds = await Membership.find({
        classIds: toId(classId),
        role: "STUDENT",
      })
        .distinct("userId")
        .exec();

      if (!userIds.length) {
        return { nodes: [], totalCount: 0 };
      }
      query._id = { $in: userIds };
    }

    const [nodes, totalCount] = await Promise.all([
      User.find(query)
        .sort({ name: 1 })
        .skip(offset)
        .limit(Math.min(limit, 200))
        .lean<IUser[]>()
        .exec(),
      User.countDocuments(query),
    ]);

    return { nodes, totalCount };
  },
  studentsByTeacher: async (_: any, __: any, ctx: Ctx) => {
    requireTeacher(ctx);

    // Find classes taught by this teacher
    const classes = await ClassModel.find({
      teacherIds: toId(ctx.userId!),
    }).lean();
    if (!classes.length) return [];

    const classIds = classes.map((c) => c._id);

    // Find student memberships for those classes
    const memberships = await Membership.find({
      classIds: { $in: classIds },
      role: "STUDENT",
    }).lean();
    if (!memberships.length) return [];

    const userIds = memberships.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    // Enrich into Student DTOs (like studentsByClass)
    const results: any[] = [];
    for (const u of users) {
      for (const cid of memberships
        .filter((m) => m.userId.toString() === u._id.toString())
        .map((m) => m.classIds)
        .flat()) {
        const acct = await Account.findOne({
          studentId: u._id,
          classId: cid,
        }).lean();
        const balance =
          acct &&
          (
            await Transaction.aggregate([
              { $match: { accountId: acct._id } },
              {
                $group: {
                  _id: "$accountId",
                  balance: { $sum: "$amount" },
                },
              },
            ]).exec()
          )[0]?.balance;

        results.push({
          id: u._id.toString(),
          name: u.name,
          classId: cid.toString(),
          balance: balance ?? 0,
        });
      }
    }

    return results;
  },
};
