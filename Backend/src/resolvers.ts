// src/graphql/resolvers.ts
import { GraphQLError } from "graphql";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";
import { Types } from "mongoose";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  requireAuth,
  requireRole,
  verifyRefreshToken,
} from "./auth";

import {
  User,
  type IUser,
  Classroom,
  type IClassroom,
  ClassModel,
  type IClass,
  Membership,
  type IMembership,
  Account,
  type IAccount,
  Transaction,
  type ITransaction,
  StoreItem,
  Purchase,
  Job,
  JobApplication,
  Employment,
  Payslip,
  ClassReason,
  PayRequest,
} from "./models";

type Role = "TEACHER" | "STUDENT" | "PARENT";
type PayRequestStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "PAID"
  | "REBUKED"
  | "DENIED";
type TxType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "PURCHASE"
  | "REFUND"
  | "PAYROLL"
  | "FINE";

type Ctx = { userId?: string | null };

const toId = (id: string) => new Types.ObjectId(id);

// Map Mongo _id → GraphQL id
const pickId = (p: any) => (p?.id ?? p?._id)?.toString() ?? null;

// ----------------------
// Helpers
// ----------------------
async function getOrCreateAccount(studentId: string, classId: string) {
  const found = await Account.findOne({ studentId, classId })
    .lean<IAccount | null>()
    .exec();
  if (found) return found;

  const klass = await ClassModel.findById(classId).lean<IClass | null>().exec();
  if (!klass) throw new GraphQLError("Class not found");

  const created = await Account.create({
    studentId: toId(studentId),
    classId: toId(classId),
    classroomId: klass.classroomId,
  });
  return created.toObject() as IAccount;
}

async function computeAccountBalance(accountId: Types.ObjectId) {
  const res = await Transaction.aggregate<{
    _id: Types.ObjectId;
    balance: number;
  }>([
    { $match: { accountId } },
    {
      $group: {
        _id: "$accountId",
        balance: {
          $sum: {
            $switch: {
              branches: [
                {
                  case: { $in: ["$type", ["DEPOSIT", "REFUND", "PAYROLL"]] },
                  then: "$amount",
                },
                {
                  case: { $in: ["$type", ["WITHDRAWAL", "PURCHASE", "FINE"]] },
                  then: { $multiply: [-1, "$amount"] },
                },
                { case: { $eq: ["$type", "ADJUSTMENT"] }, then: "$amount" },
                { case: { $eq: ["$type", "TRANSFER"] }, then: 0 }, // neutral here; see note in docs
              ],
              default: 0,
            },
          },
        },
      },
    },
  ]).exec();
  return res[0]?.balance ?? 0;
}

function mapPayToTxType(): TxType {
  // Legacy "PAY" ≈ PAYROLL
  return "PAYROLL";
}

// Derived Student DTO (compat with your old UI)
type StudentDTO = {
  id: string; // User._id
  name: string;
  classId: string;
  balance: number; // computed
};

function isTeacher(ctx: Ctx & { role?: string | null }) {
  return ctx.role === "TEACHER";
}
function requireAuth(ctx: Ctx & { role?: string | null }) {
  if (!ctx.userId) throw new GraphQLError("Unauthorized");
}
function requireTeacher(ctx: Ctx & { role?: string | null }) {
  requireAuth(ctx);
  if (!isTeacher(ctx)) throw new GraphQLError("Forbidden");
}
async function requireClassTeacher(
  ctx: Ctx & { role?: string | null },
  classId: string
) {
  requireTeacher(ctx);
  const klass = await ClassModel.findById(classId).lean<IClass | null>().exec();
  if (!klass) throw new GraphQLError("Class not found");
  const teacherIds = (klass.teacherIds ?? []).map((t) => t.toString());
  if (!teacherIds.includes(ctx.userId!)) throw new GraphQLError("Forbidden");
  return klass;
}
async function assertSelfOrTeacherForStudent(
  ctx: Ctx & { role?: string | null },
  studentId: string
) {
  requireAuth(ctx);
  if (ctx.userId !== studentId && !isTeacher(ctx))
    throw new GraphQLError("Forbidden");
}
async function assertAccountAccess(
  ctx: Ctx & { role?: string | null },
  accountId: string
) {
  requireAuth(ctx);
  const acct = await Account.findById(accountId).lean<IAccount | null>().exec();
  if (!acct) throw new GraphQLError("Account not found");
  if (ctx.role === "TEACHER") {
    // Optionally: ensure teacher teaches this class
    const klass = await ClassModel.findById(acct.classId)
      .lean<IClass | null>()
      .exec();
    if (!klass) throw new GraphQLError("Class not found");
    const teacherIds = (klass.teacherIds ?? []).map((t) => t.toString());
    if (!teacherIds.includes(ctx.userId!)) throw new GraphQLError("Forbidden");
    return acct;
  }
  // Student can only view their own account
  if (acct.studentId.toString() !== ctx.userId)
    throw new GraphQLError("Forbidden");
  return acct;
}

function genJoinCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += alphabet[(Math.random() * alphabet.length) | 0];
  return out;
}

// ----------------------
// Resolvers
// ----------------------
export const resolvers = {
  // Scalars
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  // ----------------------
  // Queries
  // ----------------------
  Query: {
    // Public/browse:
    // CHANGED: classes now hides archived by default; can includeArchived=true to see all
    classes: (
      _: any,
      { includeArchived = false }: { includeArchived?: boolean }
    ) =>
      ClassModel.find(includeArchived ? {} : { isArchived: false })
        .lean<IClass[]>()
        .exec(),

    // Unchanged:
    classrooms: () => Classroom.find({}).lean<IClassroom[]>().exec(),
    classroom: (_: any, { id }: { id: string }) =>
      Classroom.findById(id).lean<IClassroom | null>().exec(),

    class: (_: any, args: { id?: string; slug?: string }) => {
      if (args.id)
        return ClassModel.findById(args.id).lean<IClass | null>().exec();
      if (args.slug)
        return ClassModel.findOne({ slug: args.slug })
          .lean<IClass | null>()
          .exec();
      return null;
    },

    // Teacher-only (rosters / memberships expose student lists)
    membershipsByClass: async (
      _: any,
      { classId, role }: { classId: string; role?: Role },
      ctx: Ctx & { role?: string | null }
    ) => {
      await requireClassTeacher(ctx, classId);
      return Membership.find({ classId, ...(role ? { role } : {}) })
        .lean<IMembership[]>()
        .exec();
    },

    // Self or Teacher
    account: async (
      _: any,
      { studentId, classId }: { studentId: string; classId: string },
      ctx: Ctx & { role?: string | null }
    ) => {
      await assertSelfOrTeacherForStudent(ctx, studentId);
      const acct = await getOrCreateAccount(studentId, classId);
      const balance = await computeAccountBalance(acct._id);
      return { ...acct, id: acct._id.toString(), balance };
    },

    // Teacher-only (returns all students with balances)
    studentsByClass: async (
      _: any,
      { classId }: { classId: string },
      ctx: Ctx & { role?: string | null }
    ) => {
      await requireClassTeacher(ctx, classId);
      // (existing body unchanged)
      const memberships = await Membership.find({ classId, role: "STUDENT" })
        .lean<IMembership[]>()
        .exec();
      if (!memberships.length) return [];
      const userIds = memberships.map((m) => m.userId);
      const users = await User.find({ _id: { $in: userIds } })
        .lean<IUser[]>()
        .exec();
      const usersById = new Map(users.map((u) => [u._id.toString(), u]));
      const results: StudentDTO[] = [];
      for (const m of memberships) {
        const u = usersById.get(m.userId.toString());
        if (!u) continue;
        const acct = await getOrCreateAccount(u._id.toString(), classId);
        const balance = await computeAccountBalance(acct._id);
        results.push({ id: u._id.toString(), name: u.name, classId, balance });
      }
      return results;
    },

    storeItemsByClass: (_: any, { classId }: { classId: string }) =>
      StoreItem.find({ classId }).lean().exec(),

    // Teacher-only (class-wide pay requests)
    payRequestsByClass: async (
      _: any,
      { classId, status }: { classId: string; status?: PayRequestStatus },
      ctx: Ctx & { role?: string | null }
    ) => {
      await requireClassTeacher(ctx, classId);
      return PayRequest.find({ classId, ...(status ? { status } : {}) })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    },

    payRequestsByStudent: async (
      _: any,
      { classId, studentId }: { classId: string; studentId: string },
      ctx: Ctx & { role?: string | null }
    ) => {
      await assertSelfOrTeacherForStudent(ctx, studentId);
      return PayRequest.find({ classId, studentId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    },

    // Teacher-only (reason management is a teacher function)
    reasonsByClass: async (
      _: any,
      { classId }: { classId: string },
      ctx: Ctx & { role?: string | null }
    ) => {
      await requireClassTeacher(ctx, classId);
      return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
    },

    // Self or Teacher for account transactions
    transactionsByAccount: async (
      _: any,
      { accountId }: { accountId: string },
      ctx: Ctx & { role?: string | null }
    ) => {
      await assertAccountAccess(ctx, accountId);
      return Transaction.find({ accountId })
        .sort({ createdAt: -1 })
        .lean<ITransaction[]>()
        .exec();
    },

    me: async (_: any, __: any, ctx: Ctx & { role?: string | null }) => {
      if (!ctx.userId) return null;
      return User.findById(ctx.userId).lean().exec();
    },

    students: async (
      _,
      args: {
        filter?: { classId?: string; search?: string; status?: string };
        limit?: number;
        offset?: number;
      },
      ctx: Ctx & { role?: string | null }
    ) => {
      // Only teachers should be able to list all students
      requireTeacher(ctx);

      const { filter, limit = 50, offset = 0 } = args;
      const { classId, search, status } = filter ?? {};

      // base query: only STUDENT role
      const query: any = { role: "STUDENT" };

      if (status) query.status = status;

      // optional free-text search (name/email, case-insensitive)
      if (search?.trim()) {
        const rx = new RegExp(search.trim(), "i");
        query.$or = [{ name: rx }, { email: rx }];
      }

      // optional class membership filter
      if (classId) {
        const userIds = await Membership.find({
          classId: toId(classId),
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
          .limit(Math.min(limit, 200)) // safety cap
          .lean<IUser[]>()
          .exec(),
        User.countDocuments(query),
      ]);

      return { nodes, totalCount };
    },
  },

  // ----------------------
  // Mutations
  // ----------------------
  Mutation: {
    // Creates a Class (and optionally a Classroom if not supplied).
    // Seeds reasons, students (Users+Memberships+Accounts), jobs, and storeItems.
    async createClass(_: any, { input }: any, ctx: any) {
      requireAuth(ctx);
      requireTeacher(ctx);


      // Optional slug uniqueness
      if (input.slug) {
        const exists = await ClassModel.findOne({ slug: input.slug })
          .lean()
          .exec();
        if (exists) throw new GraphQLError("Slug already exists");
      }

      // Determine classroom (create if needed)
      let classroomId: Types.ObjectId;
      if (input.classroomId) {
        classroomId = new Types.ObjectId(input.classroomId);
      } else {
        const ownerId: Types.ObjectId = input.ownerId
          ? new Types.ObjectId(input.ownerId)
          : (await User.findOne({ role: "TEACHER" }).lean().exec())?._id!;
        if (!ownerId) {
          throw new GraphQLError(
            "No owner teacher found; provide ownerId or create a TEACHER first."
          );
        }
        const classroom = await Classroom.create({
          name: input.name,
          ownerId,
          settings: { currency: input.defaultCurrency ?? "CE$" }, // currency stored at Classroom level
        });
        classroomId = classroom._id;
      }

      // Create the Class
      const cls = await ClassModel.create({
        classroomId,
        name: input.name,
        subject: input.subject ?? null,
        period: input.period ?? null,
        gradeLevel: input.gradeLevel ?? null,
        joinCode: undefined, // will be set by schema pre-validate if not provided
        schoolName: input.schoolName ?? null,
        district: input.district ?? null,
        payPeriodDefault: input.payPeriodDefault ?? null,
        startingBalance: input.startingBalance ?? null,
        slug: input.slug ?? null,
        teacherIds: input.teacherIds?.map(
          (id: string) => new Types.ObjectId(id)
        ) ?? [new Types.ObjectId(ctx.userId)],
        storeSettings: input.storeSettings ?? undefined,
        isArchived: false,
      });

      // Reasons (skip duplicates)
      if (Array.isArray(input.reasons) && input.reasons.length) {
        try {
          await ClassReason.insertMany(
            input.reasons.map((label: string) => ({ classId: cls._id, label })),
            { ordered: false }
          );
        } catch {
          /* ignore dups */
        }
      }

      // Students: create (User role=STUDENT) if needed, add membership + account (+ optional starting balance)
      if (Array.isArray(input.students) && input.students.length) {
        for (const s of input.students) {
          let userId: Types.ObjectId | null = null;
          if (s.userId) {
            userId = new Types.ObjectId(s.userId);
          } else if (s.name) {
            const user = await User.create({ role: "STUDENT", name: s.name });
            userId = user._id;
          }
          if (!userId) continue;

          await Membership.updateOne(
            { userId, classId: cls._id, role: "STUDENT" },
            { $setOnInsert: { status: "ACTIVE" } },
            { upsert: true }
          );

          const account = await Account.findOne({
            studentId: userId,
            classId: cls._id,
          })
            .lean()
            .exec();
          let acctId: Types.ObjectId;
          if (account) {
            acctId = account._id;
          } else {
            const created = await Account.create({
              studentId: userId,
              classId: cls._id,
              classroomId,
            });
            acctId = created._id;
          }

          // Seed starting balance, if defined and > 0
          if ((cls.startingBalance ?? 0) > 0) {
            await Transaction.create({
              accountId: acctId,
              classId: cls._id,
              classroomId,
              type: "DEPOSIT",
              amount: cls.startingBalance!,
              memo: "Starting balance",
              createdByUserId: new Types.ObjectId(ctx.userId),
            });
          }
        }
      }

      // Jobs
      if (Array.isArray(input.jobs) && input.jobs.length) {
        await Job.insertMany(
          input.jobs.map((j: any) => ({
            classId: cls._id,
            title: j.title,
            description: j.description ?? undefined,
            salary: { amount: j.salary ?? 0, unit: "FIXED" },
            period: j.payPeriod,
            schedule: j.schedule ?? undefined,
            capacity: { current: 0, max: j.slots ?? 1 },
            active: j.active ?? true,
          })),
          { ordered: false }
        ).catch(() => {});
      }

      // Store Items
      if (Array.isArray(input.storeItems) && input.storeItems.length) {
        await StoreItem.insertMany(
          input.storeItems.map((i: any) => ({
            classId: cls._id,
            title: i.title,
            price: i.price,
            description: i.description ?? undefined,
            imageUrl: i.imageUrl ?? undefined,
            stock: i.stock ?? null,
            perStudentLimit: i.perStudentLimit ?? null,
            active: i.active ?? true,
            sort: i.sort ?? 0,
          })),
          { ordered: false }
        ).catch(() => {});
      }

      return cls.toObject();
    },

    // NEW: updateClass
    async updateClass(_: any, { id, input }: any, ctx: any) {
      requireAuth(ctx);
      const klass = await ClassModel.findById(id).lean<IClass | null>().exec();
      if (!klass) throw new GraphQLError("Class not found");
      await requireClassTeacher(ctx, id);

      if (input.slug) {
        const exists = await ClassModel.findOne({
          slug: input.slug,
          _id: { $ne: id },
        })
          .lean()
          .exec();
        if (exists) throw new GraphQLError("Slug already exists");
      }

      const update: any = {};
      for (const k of [
        "name",
        "subject",
        "period",
        "gradeLevel",
        "schoolName",
        "district",
        "payPeriodDefault",
        "startingBalance",
        "slug",
        "storeSettings",
        "isArchived",
      ]) {
        if (k in input) update[k] = input[k];
      }
      if (Array.isArray(input.teacherIds)) {
        update.teacherIds = input.teacherIds.map(
          (x: string) => new Types.ObjectId(x)
        );
      }

      const updated = await ClassModel.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      )
        .lean()
        .exec();
      return updated;
    },

    // NEW: rotateJoinCode
    async rotateJoinCode(_: any, { id }: any, ctx: any) {
      requireAuth(ctx);
      await requireClassTeacher(ctx, id);
      const next = genJoinCode();
      const updated = await ClassModel.findByIdAndUpdate(
        id,
        { $set: { joinCode: next } },
        { new: true }
      )
        .lean()
        .exec();
      if (!updated) throw new GraphQLError("Class not found");
      return updated;
    },

    // NEW: deleteClass (soft by default, hard optional)
    async deleteClass(_: any, { id, hard = false }: any, ctx: any) {
      requireAuth(ctx);
      await requireClassTeacher(ctx, id);

      if (!hard) {
        await ClassModel.findByIdAndUpdate(id, {
          $set: { isArchived: true },
        }).exec();
        return true;
      }

      // HARD DELETE (remove dependents)
      // Note: if you prefer, wrap in a transaction with Mongo sessions.
      await Promise.all([
        Membership.deleteMany({ classId: id }).exec(),
        Account.deleteMany({ classId: id }).exec(),
        Transaction.deleteMany({ classId: id }).exec(),
        StoreItem.deleteMany({ classId: id }).exec(),
        Job.deleteMany({ classId: id }).exec(),
        JobApplication.deleteMany({ classId: id }).exec(),
        Employment.deleteMany({ classId: id }).exec(),
        Payslip.deleteMany({ classId: id }).exec(),
        ClassReason.deleteMany({ classId: id }).exec(),
        PayRequest.deleteMany({ classId: id }).exec(),
      ]);
      await ClassModel.findByIdAndDelete(id).exec();
      return true;
    },

    async addReasons(
      _: any,
      { classId, labels }: { classId: string; labels: string[] }
    ) {
      await requireClassTeacher(ctx, classId);
      if (!labels?.length)
        return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
      try {
        await ClassReason.insertMany(
          labels.map((label) => ({ classId: toId(classId), label })),
          {
            ordered: false,
          }
        );
      } catch {
        /* swallow dups */
      }
      return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
    },

    async setReasons(
      _: any,
      { classId, labels }: { classId: string; labels: string[] },
      ctx: Ctx & { role?: string | null }
    ) {
      await requireClassTeacher(ctx, classId);

      await ClassReason.deleteMany({ classId }).exec();
      if (labels?.length) {
        await ClassReason.insertMany(
          labels.map((label) => ({ classId: toId(classId), label }))
        );
      }
      return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
    },

    async createPayRequest(_: any, { input }: any) {
      const reason = await ClassReason.findOne({
        classId: input.classId,
        label: input.reason,
      })
        .lean()
        .exec();
      if (!reason) throw new GraphQLError("Reason not allowed for this class");

      const isMember = await Membership.findOne({
        classId: input.classId,
        userId: input.studentId,
        role: "STUDENT",
      })
        .lean()
        .exec();
      if (!isMember) throw new GraphQLError("Student not found in this class");

      return PayRequest.create({
        classId: toId(input.classId),
        studentId: toId(input.studentId),
        amount: input.amount,
        reason: input.reason,
        justification: input.justification,
        status: "SUBMITTED",
      });
    },

    approvePayRequest: (
      _: any,
      { id, comment }: { id: string; comment?: string }
    ) =>
      PayRequest.findByIdAndUpdate(
        id,
        { $set: { status: "APPROVED", teacherComment: comment ?? null } },
        { new: true }
      )
        .lean()
        .exec(),

    async submitPayRequest(_: any, { id }: { id: string }, ctx: Ctx) {
      const req = await PayRequest.findById(id).lean().exec();
      if (!req) throw new GraphQLError("Request not found");
      if (req.status === "DENIED")
        throw new GraphQLError("Denied request cannot be paid");
      if (req.status === "PAID") return req;

      const acct = await getOrCreateAccount(
        req.studentId.toString(),
        req.classId.toString()
      );
      const klass = await ClassModel.findById(req.classId)
        .lean<IClass | null>()
        .exec();
      if (!klass) throw new GraphQLError("Class not found");

      await Transaction.create({
        accountId: acct._id,
        classId: klass._id,
        classroomId: klass.classroomId,
        type: mapPayToTxType(), // PAYROLL
        amount: req.amount,
        memo: `One-time payment: ${req.reason}`,
        createdByUserId: ctx.userId ? toId(ctx.userId) : req.studentId, // use approver if available
      });

      const updated = await PayRequest.findByIdAndUpdate(
        id,
        { $set: { status: "PAID" } },
        { new: true }
      )
        .lean()
        .exec();

      return updated;
    },

    async rebukePayRequest(
      _: any,
      { id, comment }: { id: string; comment: string }
    ) {
      if (!comment?.trim())
        throw new GraphQLError("Comment required for rebuke");
      return PayRequest.findByIdAndUpdate(
        id,
        { $set: { status: "REBUKED", teacherComment: comment } },
        { new: true }
      )
        .lean()
        .exec();
    },

    denyPayRequest: (
      _: any,
      { id, comment }: { id: string; comment?: string }
    ) =>
      PayRequest.findByIdAndUpdate(
        id,
        { $set: { status: "DENIED", teacherComment: comment ?? null } },
        { new: true }
      )
        .lean()
        .exec(),

    async signUp(_: any, { input }: any, ctx: any) {
      const { name, email, password, role } = input;
      const existing = await User.findOne({ email: email.toLowerCase() })
        .lean()
        .exec();
      if (existing) throw new GraphQLError("Email already in use");

      const passwordHash = await hashPassword(password);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      });

      const accessToken = signAccessToken(user._id.toString(), role);
      const refreshToken = signRefreshToken(user._id.toString(), role);
      setRefreshCookie(ctx.res, refreshToken);

      return { user: user.toObject(), accessToken };
    },

    // NEW: login
    async login(_: any, { email, password }: any, ctx: any) {
      const user = await User.findOne({ email: email.toLowerCase() })
        .lean()
        .exec();
      if (!user) throw new GraphQLError("Invalid credentials");

      const ok = await verifyPassword(password, (user as any).passwordHash);
      if (!ok) throw new GraphQLError("Invalid credentials");

      const accessToken = signAccessToken(user._id.toString(), user.role);
      const refreshToken = signRefreshToken(user._id.toString(), user.role);
      setRefreshCookie(ctx.res, refreshToken);

      return { user, accessToken };
    },

    // NEW: refreshAccessToken
    async refreshAccessToken(_: any, __: any, ctx: any) {
      const cookie = ctx.req.cookies?.refresh_token;
      if (!cookie) throw new GraphQLError("No refresh token");
      try {
        const { sub, role } = verifyRefreshToken(cookie);
        const accessToken = signAccessToken(sub, role as any);
        // optional: roll refresh cookie lifetime
        // setRefreshCookie(ctx.res, cookie);
        return accessToken;
      } catch {
        throw new GraphQLError("Invalid refresh token");
      }
    },

    // NEW: logout
    async logout(_: any, __: any, ctx: any) {
      clearRefreshCookie(ctx.res);
      return true;
    },
  },

  // ----------------------
  // Field Resolvers
  // ----------------------

  // id mappers for simple types (keep once)
  Classroom: { id: pickId },
  User: { id: pickId },
  Membership: { id: pickId },
  Account: { id: pickId },
  Transaction: { id: pickId },
  StoreItem: { id: pickId },
  Purchase: { id: pickId },
  Job: { id: pickId },
  JobApplication: { id: pickId },
  Employment: { id: pickId },
  Payslip: { id: pickId },
  ClassReason: { id: pickId },

  // Merge Class into a single resolver entry
  Class: {
    id: pickId,

    // Resolve defaultCurrency for compatibility by looking up the Classroom
    defaultCurrency: async (p: IClass) => {
      const classroom = await Classroom.findById(p.classroomId)
        .lean<IClassroom | null>()
        .exec();
      return classroom?.settings?.currency ?? "CE$";
    },

    // ✅ Provide a real implementation (no placeholder)
    students: async (p: IClass) => {
      const memberships = await Membership.find({
        classId: p._id,
        role: "STUDENT",
      })
        .lean<IMembership[]>()
        .exec();
      if (!memberships.length) return [];

      const userIds = memberships.map((m) => m.userId);
      const users = await User.find({ _id: { $in: userIds } })
        .lean<IUser[]>()
        .exec();

      const out: StudentDTO[] = [];
      for (const u of users) {
        const acct = await Account.findOne({
          studentId: u._id,
          classId: p._id,
        })
          .lean()
          .exec();

        let balance = 0;
        if (acct) {
          // reuse your helper if you prefer:
          // balance = await computeAccountBalance(acct._id);
          const res = await Transaction.aggregate<{
            _id: Types.ObjectId;
            balance: number;
          }>([
            { $match: { accountId: acct._id } },
            {
              $group: {
                _id: "$accountId",
                balance: {
                  $sum: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $in: ["$type", ["DEPOSIT", "REFUND", "PAYROLL"]],
                          },
                          then: "$amount",
                        },
                        {
                          case: {
                            $in: ["$type", ["WITHDRAWAL", "PURCHASE", "FINE"]],
                          },
                          then: { $multiply: [-1, "$amount"] },
                        },
                        {
                          case: { $eq: ["$type", "ADJUSTMENT"] },
                          then: "$amount",
                        },
                        { case: { $eq: ["$type", "TRANSFER"] }, then: 0 },
                      ],
                      default: 0,
                    },
                  },
                },
              },
            },
          ]).exec();
          balance = res[0]?.balance ?? 0;
        }

        out.push({
          id: u._id.toString(),
          name: u.name,
          classId: p._id.toString(),
          balance,
        });
      }
      return out;
    },

    storeItems: (p: IClass) => StoreItem.find({ classId: p._id }).lean().exec(),
    jobs: (p: IClass) => Job.find({ classId: p._id }).lean().exec(),
    transactions: (p: IClass) =>
      Transaction.find({ classId: p._id })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    payRequests: (p: IClass) =>
      PayRequest.find({ classId: p._id }).sort({ createdAt: -1 }).lean().exec(),
    reasons: (p: IClass) =>
      ClassReason.find({ classId: p._id }).sort({ label: 1 }).lean().exec(),
  },

  PayRequest: {
    id: pickId,
    class: (p: any) => ClassModel.findById(p.classId).lean().exec(),
    student: (p: any) => User.findById(p.studentId).lean().exec(), // a User with role=STUDENT
  },

  // Student DTO resolvers (compat)
  Student: {
    class: (p: StudentDTO) => ClassModel.findById(p.classId).lean().exec(),
    txns: async (p: StudentDTO) => {
      const acct = await Account.findOne({
        studentId: p.id,
        classId: p.classId,
      })
        .lean()
        .exec();
      if (!acct) return [];
      return Transaction.find({ accountId: acct._id })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    },
    requests: (p: StudentDTO) =>
      PayRequest.find({ studentId: p.id, classId: p.classId })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
  },
};
