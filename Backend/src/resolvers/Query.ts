import { GraphQLError } from "graphql";
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
  PayRequestComment,
  Notification,
  Purchase,
  RedemptionRequest,
  Job,
  JobApplication,
  Employment,
  Fine,
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
    
    let acct = await Account.findOne({
      studentId: toId(studentId),
      classId: toId(classId),
    }).lean();

    if (!acct) {
      // Get class to find classroom ID
      const cls = await ClassModel.findById(classId).lean();
      if (!cls) {
        throw new Error("Class not found");
      }

      // Create account with required classroomId
      const newAccount = await Account.create({
        studentId: toId(studentId),
        classId: toId(classId),
        classroomId: cls.classroomId,
      });
      acct = newAccount.toObject();
    }

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

  payRequest: async (_: any, { id }: any, ctx: any) => {
    const payRequest = await PayRequest.findById(id).lean().exec();
    if (!payRequest) return null;

    // Check if user has access to this request
    const userId = ctx.userId;
    const isStudent = payRequest.studentId.toString() === userId;
    let isTeacher = false;
    
    if (!isStudent && userId) {
      const membership = await Membership.findOne({
        userId: toId(userId),
        role: "TEACHER",
        classIds: payRequest.classId,
      }).lean().exec();
      isTeacher = !!membership;
    }

    if (!isStudent && !isTeacher) {
      throw new GraphQLError("Access denied");
    }

    return payRequest;
  },

  payRequestComments: async (_: any, { payRequestId }: any, ctx: any) => {
    const payRequest = await PayRequest.findById(payRequestId).lean().exec();
    if (!payRequest) {
      throw new GraphQLError("Pay request not found");
    }

    // Check access (same logic as payRequest query)
    const userId = ctx.userId;
    const isStudent = payRequest.studentId.toString() === userId;
    let isTeacher = false;
    
    if (!isStudent && userId) {
      const membership = await Membership.findOne({
        userId: toId(userId),
        role: "TEACHER",
        classIds: payRequest.classId,
      }).lean().exec();
      isTeacher = !!membership;
    }

    if (!isStudent && !isTeacher) {
      throw new GraphQLError("Access denied");
    }

    return PayRequestComment.find({ payRequestId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  },

  reasonsByClass: async (_: any, { classId }: any, ctx: any) => {
    // Allow authenticated users (both students and teachers) to view reasons
    requireAuth(ctx);
    return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
  },

  studentsByClass: async (_: any, { classId }: any, ctx: any) => {
    // Allow both teachers and students to access this - students need it for dashboard
    requireAuth(ctx);
    
    // Find student memberships for this class
    const memberships = await Membership.find({
      classIds: toId(classId),
      role: "STUDENT",
    }).lean();
    
    if (!memberships.length) return [];

    const userIds = memberships.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    // Build Student DTOs with account balances
    const results: any[] = [];
    for (const user of users) {
      // Get account for this student in this class
      let account = await Account.findOne({
        studentId: user._id,
        classId: toId(classId),
      }).lean();

      // Create account if it doesn't exist
      if (!account) {
        const cls = await ClassModel.findById(classId).lean();
        if (cls) {
          const newAccount = await Account.create({
            studentId: user._id,
            classId: toId(classId),
            classroomId: cls.classroomId,
          });
          account = newAccount.toObject();
        }
      }

      // Calculate balance from transactions
      let balance = 0;
      if (account) {
        const balanceResult = await Transaction.aggregate([
          { $match: { accountId: account._id } },
          { $group: { _id: "$accountId", balance: { $sum: "$amount" } } },
        ]).exec();
        balance = balanceResult[0]?.balance ?? 0;
      }

      results.push({
        id: user._id.toString(),
        name: user.name,
        classId: classId,
        balance: balance,
      });
    }

    return results;
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
    console.log("DEBUG classesByUser:", { 
      userId, 
      role, 
      includeArchived,
      contextUserId: ctx.userId,
      contextRole: ctx.role 
    });

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

    console.log("DEBUG found memberships:", memberships);

    const classIdObjs = Array.from(
      new Set(
        memberships.flatMap((m) =>
          (m.classIds ?? []).filter(Boolean).map((cid: any) => cid.toString())
        )
      )
    ).map((s) => new Types.ObjectId(s));

    console.log("DEBUG classIdObjs:", classIdObjs);

    if (!classIdObjs.length) return [];

    const classes = await ClassModel.find({
      _id: { $in: classIdObjs },
      ...(includeArchived ? {} : { isArchived: false }),
    })
      .lean()
      .exec();

    console.log("DEBUG found classes:", classes);

    return classes;
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

  // Notifications
  notifications: async (
    _: any,
    { userId, limit = 50, unreadOnly = false }: { userId?: string; limit?: number; unreadOnly?: boolean },
    ctx: Ctx
  ) => {
    requireAuth(ctx);
    
    // Users can only query their own notifications unless they're a teacher
    const targetUserId = userId || ctx.userId!;
    if (targetUserId !== ctx.userId && ctx.role !== "TEACHER") {
      throw new GraphQLError("Unauthorized");
    }

    const query: any = { userId: toId(targetUserId) };
    if (unreadOnly) {
      query.isRead = false;
    }

    console.log('Querying notifications:', { query, targetUserId, limit, unreadOnly });
    const results = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    console.log('Notifications query returned:', results.length, 'notifications');
    console.log('First notification sample:', results[0]);
    return results;
  },

  unreadNotificationCount: async (_: any, __: any, ctx: Ctx) => {
    requireAuth(ctx);
    
    return Notification.countDocuments({
      userId: toId(ctx.userId!),
      isRead: false,
    }).exec();
  },

  // Redemption and Backpack queries
  studentBackpack: async (
    _: any,
    { studentId, classId }: { studentId: string; classId: string },
    ctx: Ctx
  ) => {
    await assertSelfOrTeacherForStudent(ctx, studentId);
    
    return Purchase.find({
      studentId: toId(studentId),
      classId: toId(classId),
      status: "in-backpack", // Only show items still in backpack
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  purchaseHistory: async (
    _: any,
    { studentId, classId }: { studentId: string; classId: string },
    ctx: Ctx
  ) => {
    await assertSelfOrTeacherForStudent(ctx, studentId);
    
    return Purchase.find({
      studentId: toId(studentId),
      classId: toId(classId),
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  redemptionRequests: async (
    _: any,
    { classId, status }: { classId: string; status?: string },
    ctx: Ctx
  ) => {
    await requireClassTeacher(ctx, classId);
    
    const query: any = { classId: toId(classId) };
    if (status) {
      // Convert GraphQL enum (UPPERCASE) to database format (lowercase)
      query.status = status.toLowerCase();
    }

    return RedemptionRequest.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  redemptionRequest: async (_: any, { id }: { id: string }, ctx: Ctx) => {
    requireAuth(ctx);
    
    const request = await RedemptionRequest.findById(id).lean().exec();
    if (!request) return null;

    // Check if user has access to this request
    const userId = ctx.userId;
    const isStudent = request.studentId.toString() === userId;
    let isTeacher = false;
    
    if (!isStudent && userId) {
      const membership = await Membership.findOne({
        userId: toId(userId),
        role: "TEACHER",
        classIds: request.classId,
      }).lean().exec();
      isTeacher = !!membership;
    }

    if (!isStudent && !isTeacher) {
      throw new GraphQLError("Access denied");
    }

    return request;
  },

  redemptionHistory: async (
    _: any,
    { studentId, classId }: { studentId: string; classId: string },
    ctx: Ctx
  ) => {
    await assertSelfOrTeacherForStudent(ctx, studentId);
    
    return RedemptionRequest.find({
      studentId: toId(studentId),
      classId: toId(classId),
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  // Job queries
  jobs: async (
    _: any,
    { classId, activeOnly = true }: { classId: string; activeOnly?: boolean },
    ctx: Ctx
  ) => {
    requireAuth(ctx);
    
    const query: any = { classId: toId(classId) };
    if (activeOnly) {
      query.active = true;
    }
    
    return Job.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  job: async (_: any, { id }: { id: string }, ctx: Ctx) => {
    requireAuth(ctx);
    return Job.findById(id).lean().exec();
  },

  // Job application queries
  jobApplications: async (
    _: any,
    { jobId, studentId, classId, status }: { 
      jobId?: string; 
      studentId?: string; 
      classId?: string;
      status?: string;
    },
    ctx: Ctx
  ) => {
    requireAuth(ctx);
    
    const query: any = {};
    if (jobId) query.jobId = toId(jobId);
    if (studentId) query.studentId = toId(studentId);
    if (classId) query.classId = toId(classId);
    if (status) query.status = status;
    
    // If querying by student, ensure it's them or a teacher
    if (studentId) {
      await assertSelfOrTeacherForStudent(ctx, studentId);
    }
    
    return JobApplication.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  jobApplication: async (_: any, { id }: { id: string }, ctx: Ctx) => {
    requireAuth(ctx);
    
    const application = await JobApplication.findById(id).lean().exec();
    if (!application) return null;
    
    // Verify access (student who applied or teacher in class)
    const userId = ctx.userId;
    const isStudent = application.studentId.toString() === userId;
    
    if (!isStudent && userId) {
      const membership = await Membership.findOne({
        userId: toId(userId),
        role: "TEACHER",
        classIds: application.classId,
      }).lean().exec();
      
      if (!membership) {
        throw new GraphQLError("Access denied");
      }
    }
    
    return application;
  },

  // Employment queries
  studentEmployments: async (
    _: any,
    { studentId, classId, status }: { 
      studentId: string; 
      classId: string;
      status?: string;
    },
    ctx: Ctx
  ) => {
    await assertSelfOrTeacherForStudent(ctx, studentId);
    
    const query: any = {
      studentId: toId(studentId),
      classId: toId(classId),
    };
    if (status) query.status = status;
    
    return Employment.find(query)
      .sort({ startedAt: -1 })
      .lean()
      .exec();
  },

  jobEmployments: async (
    _: any,
    { jobId, status }: { jobId: string; status?: string },
    ctx: Ctx
  ) => {
    requireAuth(ctx);
    
    const job = await Job.findById(jobId).lean().exec();
    if (!job) {
      throw new GraphQLError("Job not found");
    }
    
    // Verify teacher has access to this class
    await requireClassTeacher(ctx, job.classId.toString());
    
    const query: any = { jobId: toId(jobId) };
    if (status) query.status = status;
    
    return Employment.find(query)
      .sort({ startedAt: -1 })
      .lean()
      .exec();
  },

  classStatistics: async (
    _: any,
    { classId }: { classId: string },
    ctx: Ctx
  ) => {
    requireAuth(ctx);
    await requireClassTeacher(ctx, classId);

    const classIdObj = toId(classId);

    // Get student count
    const totalStudents = await Membership.countDocuments({
      classIds: classIdObj,
      role: "STUDENT",
    });

    // Get job stats
    const totalJobs = await Job.countDocuments({ classId: classIdObj });
    const activeJobs = await Job.countDocuments({ classId: classIdObj, active: true });

    // Get employment stats
    const totalEmployments = await Employment.countDocuments({ 
      classId: classIdObj,
      status: "ACTIVE" 
    });

    // Get application stats
    const pendingApplications = await JobApplication.countDocuments({
      classId: classIdObj,
      status: "PENDING",
    });

    // Get transaction stats
    const totalTransactions = await Transaction.countDocuments({ classId: classIdObj });

    // Get pay request stats
    const totalPayRequests = await PayRequest.countDocuments({ classId: classIdObj });
    const pendingPayRequests = await PayRequest.countDocuments({
      classId: classIdObj,
      status: "SUBMITTED",
    });

    // Get balance stats - compute from transactions
    // Note: FINE and PURCHASE are already stored as negative amounts, so we just sum them directly
    const balanceAgg = await Transaction.aggregate([
      { $match: { classId: classIdObj } },
      {
        $group: {
          _id: "$accountId",
          balance: { $sum: "$amount" }
        },
      },
    ]);
    
    const totalCirculation = balanceAgg.reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
    const averageBalance = totalStudents > 0 ? totalCirculation / totalStudents : 0;

    return {
      totalStudents,
      totalJobs,
      activeJobs,
      totalEmployments,
      pendingApplications,
      totalTransactions,
      totalPayRequests,
      pendingPayRequests,
      averageBalance: Math.round(averageBalance * 100) / 100,
      totalCirculation: Math.round(totalCirculation * 100) / 100,
    };
  },

  // Fine queries
  finesByClass: async (_: any, { classId, status }: any, ctx: Ctx) => {
    requireAuth(ctx);
    await requireClassTeacher(ctx, classId);

    const query: any = { classId: toId(classId) };
    if (status) {
      query.status = status;
    }

    return Fine.find(query)
      .sort({ createdAt: -1 })
      .exec();
  },

  finesByStudent: async (_: any, { studentId, classId }: any, ctx: Ctx) => {
    requireAuth(ctx);
    await assertSelfOrTeacherForStudent(ctx, studentId);

    return Fine.find({
      studentId: toId(studentId),
      classId: toId(classId),
    })
      .sort({ createdAt: -1 })
      .exec();
  },

  fine: async (_: any, { id }: any, ctx: Ctx) => {
    requireAuth(ctx);
    const fine = await Fine.findById(id).exec();
    
    if (!fine) {
      throw new GraphQLError("Fine not found");
    }

    // Check if user is the student or a teacher in the class
    await assertSelfOrTeacherForStudent(ctx, fine.studentId.toString());

    return fine;
  },
};
