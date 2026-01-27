import { GraphQLError } from "graphql";
import {
  User,
  ClassModel,
  Classroom,
  Membership,
  Account,
  Transaction,
  BetaAccessCode,
  AuditLog,
} from "../models";
import { requireAuth, toId, Ctx } from "./helpers";
import { authClient } from "../services/auth-client";
import { Types } from "mongoose";

// Helper to check if user is an admin
function requireAdmin(ctx: Ctx) {
  requireAuth(ctx);
  if (ctx.role !== "ADMIN") {
    throw new GraphQLError("Access denied. Admin privileges required.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

// Helper to create audit log
async function createAuditLog(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, any>,
  _ctx?: Ctx
) {
  await AuditLog.create({
    adminUserId: toId(adminUserId),
    action,
    targetType,
    targetId: toId(targetId),
    details,
    ipAddress: null, // Would need to pass from Express context
    userAgent: null,
  });
}

export const AdminQuery = {
  async adminDashboardStats(_: any, __: any, ctx: Ctx) {
    requireAdmin(ctx);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalParents,
      totalAdmins,
      activeUsers,
      bannedUsers,
      disabledUsers,
      totalClasses,
      activeClasses,
      archivedClasses,
      totalClassrooms,
      totalBetaCodes,
      activeBetaCodes,
      betaCodeUses,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "TEACHER" }),
      User.countDocuments({ role: "STUDENT" }),
      User.countDocuments({ role: "PARENT" }),
      User.countDocuments({ role: "ADMIN" }),
      User.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ status: "BANNED" }),
      User.countDocuments({ status: "DISABLED" }),
      ClassModel.countDocuments(),
      ClassModel.countDocuments({ isArchived: false }),
      ClassModel.countDocuments({ isArchived: true }),
      Classroom.countDocuments(),
      BetaAccessCode.countDocuments(),
      BetaAccessCode.countDocuments({ isActive: true }),
      BetaAccessCode.aggregate([
        { $group: { _id: null, total: { $sum: "$currentUses" } } },
      ]).then((r) => r[0]?.total ?? 0),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    return {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalParents,
      totalAdmins,
      activeUsers,
      bannedUsers,
      disabledUsers,
      totalClasses,
      activeClasses,
      archivedClasses,
      totalClassrooms,
      totalBetaCodes,
      activeBetaCodes,
      totalBetaCodeUses: betaCodeUses,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    };
  },

  async adminUsers(
    _: any,
    { search, role, status, limit = 50, offset = 0, sortBy = "createdAt", sortOrder = "desc" }: any,
    ctx: Ctx
  ) {
    requireAdmin(ctx);

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortBy]: sortDirection };

    const [nodes, totalCount] = await Promise.all([
      User.find(filter).sort(sort).skip(offset).limit(limit).lean().exec(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      nodes: nodes.map((u) => ({ ...u, id: u._id.toString() })),
      totalCount,
      pageInfo: {
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        totalPages,
        currentPage,
      },
    };
  },

  async adminUser(_: any, { id }: { id: string }, ctx: Ctx) {
    requireAdmin(ctx);
    const user = await User.findById(id).lean().exec();
    if (!user) return null;
    return { ...user, id: user._id.toString() };
  },

  async adminClasses(
    _: any,
    { search, isArchived, limit = 50, offset = 0 }: any,
    ctx: Ctx
  ) {
    requireAdmin(ctx);

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { schoolName: { $regex: search, $options: "i" } },
      ];
    }
    if (typeof isArchived === "boolean") {
      filter.isArchived = isArchived;
    }

    const classes = await ClassModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    return classes.map((c) => ({ ...c, id: c._id.toString() }));
  },

  async adminClassrooms(_: any, { limit = 50, offset = 0 }: any, ctx: Ctx) {
    requireAdmin(ctx);
    const classrooms = await Classroom.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
    return classrooms.map((c) => ({ ...c, id: c._id.toString() }));
  },

  async adminBetaCodes(_: any, { activeOnly = false }: any, ctx: Ctx) {
    requireAdmin(ctx);
    const filter = activeOnly ? { isActive: true } : {};
    const codes = await BetaAccessCode.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return codes.map((c) => ({ ...c, id: c._id.toString() }));
  },

  async adminAuditLogs(
    _: any,
    { adminUserId, action, targetType, limit = 50, offset = 0 }: any,
    ctx: Ctx
  ) {
    requireAdmin(ctx);

    const filter: any = {};
    if (adminUserId) filter.adminUserId = toId(adminUserId);
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const [nodes, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      nodes: nodes.map((l) => ({ ...l, id: l._id.toString() })),
      totalCount,
    };
  },
};

export const AdminMutation = {
  async adminBanUser(_: any, { userId, reason }: { userId: string; reason: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");
    if (user.role === "ADMIN") throw new GraphQLError("Cannot ban an admin user");

    const previousStatus = user.status;
    user.status = "BANNED" as any;
    (user as any).banReason = reason;
    (user as any).bannedAt = new Date();
    (user as any).bannedByUserId = toId(ctx.userId!);
    await user.save();

    await createAuditLog(
      ctx.userId!,
      "BAN_USER",
      "User",
      userId,
      { previousStatus, reason },
      ctx
    );

    return { ...user.toObject(), id: user._id.toString() };
  },

  async adminUnbanUser(_: any, { userId }: { userId: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");
    if (user.status !== "BANNED") throw new GraphQLError("User is not banned");

    user.status = "ACTIVE";
    (user as any).banReason = null;
    (user as any).bannedAt = null;
    (user as any).bannedByUserId = null;
    await user.save();

    await createAuditLog(ctx.userId!, "UNBAN_USER", "User", userId, {}, ctx);

    return { ...user.toObject(), id: user._id.toString() };
  },

  async adminUpdateUser(_: any, { userId, input }: any, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");

    const previousValues: any = {};
    for (const key of Object.keys(input)) {
      if (input[key] !== undefined) {
        previousValues[key] = (user as any)[key];
        (user as any)[key] = input[key];
      }
    }
    await user.save();

    await createAuditLog(
      ctx.userId!,
      "UPDATE_USER",
      "User",
      userId,
      { previousValues, newValues: input },
      ctx
    );

    return { ...user.toObject(), id: user._id.toString() };
  },

  async adminDeleteUser(_: any, { userId, hard = false }: any, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");
    if (user.role === "ADMIN") throw new GraphQLError("Cannot delete an admin user");

    if (hard) {
      // Hard delete - remove all related data
      await Promise.all([
        Membership.deleteMany({ userId: toId(userId) }),
        Account.deleteMany({ studentId: toId(userId) }),
        Transaction.deleteMany({ createdByUserId: toId(userId) }),
        User.deleteOne({ _id: toId(userId) }),
      ]);
    } else {
      // Soft delete - just mark as disabled
      user.status = "DISABLED";
      await user.save();
    }

    await createAuditLog(
      ctx.userId!,
      hard ? "HARD_DELETE_USER" : "SOFT_DELETE_USER",
      "User",
      userId,
      { userName: user.name, userEmail: user.email },
      ctx
    );

    return true;
  },

  async adminImpersonateUser(_: any, { userId }: { userId: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");
    if (user.status === "BANNED") throw new GraphQLError("Cannot impersonate a banned user");

    // Generate an access token for the target user
    const tokenData = await authClient.signTokens(
      user._id.toString(),
      user.role as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"
    );

    await createAuditLog(
      ctx.userId!,
      "IMPERSONATE_USER",
      "User",
      userId,
      { impersonatedName: user.name, impersonatedEmail: user.email },
      ctx
    );

    return {
      user: { ...user.toObject(), id: user._id.toString() },
      accessToken: tokenData.accessToken,
    };
  },

  async adminResetUserPassword(
    _: any,
    { userId, newPassword }: { userId: string; newPassword: string },
    ctx: Ctx
  ) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");
    if (!user.email) throw new GraphQLError("User has no email set");

    // Hash the new password via auth service
    const passwordHash = await authClient.hashPassword(newPassword);
    user.passwordHash = passwordHash;
    await user.save();

    await createAuditLog(
      ctx.userId!,
      "RESET_USER_PASSWORD",
      "User",
      userId,
      { userEmail: user.email },
      ctx
    );

    return true;
  },

  async adminGrantBetaAccess(_: any, { userId }: { userId: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");

    user.hasBetaAccess = true;
    await user.save();

    await createAuditLog(ctx.userId!, "GRANT_BETA_ACCESS", "User", userId, {}, ctx);

    return { ...user.toObject(), id: user._id.toString() };
  },

  async adminRevokeBetaAccess(_: any, { userId }: { userId: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");

    user.hasBetaAccess = false;
    await user.save();

    await createAuditLog(ctx.userId!, "REVOKE_BETA_ACCESS", "User", userId, {}, ctx);

    return { ...user.toObject(), id: user._id.toString() };
  },

  async adminUpdateClassroom(_: any, { classroomId, input }: any, ctx: Ctx) {
    requireAdmin(ctx);

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new GraphQLError("Classroom not found");

    const previousValues: any = {};
    if (input.name !== undefined) {
      previousValues.name = classroom.name;
      classroom.name = input.name;
    }
    if (input.settings) {
      previousValues.settings = classroom.settings;
      classroom.settings = { ...classroom.settings, ...input.settings };
    }
    await classroom.save();

    await createAuditLog(
      ctx.userId!,
      "UPDATE_CLASSROOM",
      "Classroom",
      classroomId,
      { previousValues, newValues: input },
      ctx
    );

    return { ...classroom.toObject(), id: classroom._id.toString() };
  },

  async adminDeleteClassroom(_: any, { classroomId, hard = false }: any, ctx: Ctx) {
    requireAdmin(ctx);

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new GraphQLError("Classroom not found");

    if (hard) {
      // Delete all classes in the classroom first
      const classIds = (await ClassModel.find({ classroomId: toId(classroomId) }).lean()).map(
        (c) => c._id
      );
      await Promise.all([
        ClassModel.deleteMany({ classroomId: toId(classroomId) }),
        Membership.deleteMany({ classId: { $in: classIds } }),
        Account.deleteMany({ classroomId: toId(classroomId) }),
        Classroom.deleteOne({ _id: toId(classroomId) }),
      ]);
    } else {
      // Soft delete - archive all classes
      await ClassModel.updateMany(
        { classroomId: toId(classroomId) },
        { isArchived: true }
      );
    }

    await createAuditLog(
      ctx.userId!,
      hard ? "HARD_DELETE_CLASSROOM" : "SOFT_DELETE_CLASSROOM",
      "Classroom",
      classroomId,
      { classroomName: classroom.name },
      ctx
    );

    return true;
  },

  async adminTransferClassroomOwnership(
    _: any,
    { classroomId, newOwnerId }: { classroomId: string; newOwnerId: string },
    ctx: Ctx
  ) {
    requireAdmin(ctx);

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new GraphQLError("Classroom not found");

    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) throw new GraphQLError("New owner not found");
    if (newOwner.role !== "TEACHER" && newOwner.role !== "ADMIN") {
      throw new GraphQLError("New owner must be a teacher or admin");
    }

    const previousOwnerId = classroom.ownerId;
    classroom.ownerId = toId(newOwnerId);
    await classroom.save();

    await createAuditLog(
      ctx.userId!,
      "TRANSFER_CLASSROOM_OWNERSHIP",
      "Classroom",
      classroomId,
      { previousOwnerId: previousOwnerId.toString(), newOwnerId },
      ctx
    );

    return { ...classroom.toObject(), id: classroom._id.toString() };
  },

  async adminForceDeleteClass(_: any, { classId }: { classId: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const cls = await ClassModel.findById(classId);
    if (!cls) throw new GraphQLError("Class not found");

    // Hard delete class and all related data
    await Promise.all([
      Membership.deleteMany({ classId: toId(classId) }),
      Account.deleteMany({ classId: toId(classId) }),
      Transaction.deleteMany({ classId: toId(classId) }),
      ClassModel.deleteOne({ _id: toId(classId) }),
    ]);

    await createAuditLog(
      ctx.userId!,
      "FORCE_DELETE_CLASS",
      "Class",
      classId,
      { className: cls.name },
      ctx
    );

    return true;
  },

  async adminRestoreClass(_: any, { classId }: { classId: string }, ctx: Ctx) {
    requireAdmin(ctx);

    const cls = await ClassModel.findById(classId);
    if (!cls) throw new GraphQLError("Class not found");

    cls.isArchived = false;
    await cls.save();

    await createAuditLog(ctx.userId!, "RESTORE_CLASS", "Class", classId, {}, ctx);

    return { ...cls.toObject(), id: cls._id.toString() };
  },

  async adminPurgeInactiveUsers(_: any, { daysInactive }: { daysInactive: number }, ctx: Ctx) {
    requireAdmin(ctx);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    // Find inactive users (students only for safety)
    const inactiveUsers = await User.find({
      role: "STUDENT",
      status: { $in: ["INVITED", "DISABLED"] },
      updatedAt: { $lt: cutoffDate },
    }).lean();

    const userIds = inactiveUsers.map((u) => u._id);

    if (userIds.length > 0) {
      await Promise.all([
        Membership.deleteMany({ userId: { $in: userIds } }),
        Account.deleteMany({ studentId: { $in: userIds } }),
        User.deleteMany({ _id: { $in: userIds } }),
      ]);
    }

    await createAuditLog(
      ctx.userId!,
      "PURGE_INACTIVE_USERS",
      "System",
      "bulk",
      { count: userIds.length, daysInactive },
      ctx
    );

    return userIds.length;
  },

  async adminSendBulkEmail(
    _: any,
    { userIds, subject, body }: { userIds: string[]; subject: string; body: string },
    ctx: Ctx
  ) {
    requireAdmin(ctx);

    // Get user emails
    const users = await User.find({
      _id: { $in: userIds.map((id) => toId(id)) },
      email: { $ne: null },
    }).lean();

    // TODO: Integrate with EmailService to actually send emails
    // For now, just log the action

    await createAuditLog(
      ctx.userId!,
      "SEND_BULK_EMAIL",
      "System",
      "bulk",
      { userCount: users.length, subject },
      ctx
    );

    return true;
  },
};

// Field resolvers for AuditLog
export const AuditLogResolvers = {
  AuditLog: {
    id: (parent: any) => parent._id?.toString() ?? parent.id,
    async adminUser(parent: any) {
      if (!parent.adminUserId) return null;
      const user = await User.findById(parent.adminUserId).lean();
      return user ? { ...user, id: user._id.toString() } : null;
    },
  },
};
