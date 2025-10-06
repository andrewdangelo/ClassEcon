import { GraphQLError } from "graphql";
import {
  User,
  ClassModel,
  Classroom,
  Membership,
  Account,
  Transaction,
  StoreItem,
  Job,
  ClassReason,
  PayRequest,
  Employment,
  IClass,
  JobApplication,
  Payslip,
  Purchase,
} from "../models";
import {
  requireAuth,
  requireTeacher,
  requireClassTeacher,
  toId,
  genJoinCode,
  Ctx,
} from "./helpers";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  verifyRefreshToken,
} from "../auth";
import { TransactionType } from "../utils/enums";
import { Types } from "mongoose";

export const Mutation = {
  async createClass(_: any, { input }: any, ctx: Ctx) {
    requireAuth(ctx);
    requireTeacher(ctx);

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
        settings: { currency: input.defaultCurrency ?? "CE$" },
      });
      classroomId = classroom._id;
    }

    // Create the Class
    const cls = await ClassModel.create({
      classroomId,
      name: input.name,
      description: input.description ?? null,
      subject: input.subject ?? null,
      period: input.period ?? null,
      gradeLevel: input.gradeLevel ?? null,
      joinCode: undefined,
      schoolName: input.schoolName ?? null,
      district: input.district ?? null,
      payPeriodDefault: input.payPeriodDefault ?? null,
      startingBalance: input.startingBalance ?? null,
      defaultCurrency: input.defaultCurrency ?? "CE$",
      slug: input.slug ?? null,
      teacherIds: input.teacherIds?.map(
        (id: string) => new Types.ObjectId(id)
      ) ?? [new Types.ObjectId(ctx.userId!)],
      storeSettings: input.storeSettings ?? undefined,
      status: "ACTIVE",
      isArchived: false,
    });

    await Membership.updateOne(
      { userId: toId(ctx.userId!), role: "TEACHER" },
      {
        $setOnInsert: { status: "ACTIVE" },
        $addToSet: { classIds: cls._id },
      },
      { upsert: true }
    ).exec();

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

    // Students: create if needed, then add to membership.classIds and ensure account (+ optional starting balance)
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
          { userId, role: "STUDENT" },
          {
            $setOnInsert: { status: "ACTIVE" },
            $addToSet: { classIds: cls._id },
          },
          { upsert: true }
        ).exec();

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

        if ((cls.startingBalance ?? 0) > 0) {
          await Transaction.create({
            accountId: acctId,
            classId: cls._id,
            classroomId,
            type: "DEPOSIT",
            amount: cls.startingBalance!,
            memo: "Starting balance",
            createdByUserId: new Types.ObjectId(ctx.userId!),
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

  async updateClass(_: any, { id, input }: any, ctx: Ctx) {
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
      "description",
      "subject",
      "period",
      "gradeLevel",
      "schoolName",
      "district",
      "payPeriodDefault",
      "startingBalance",
      "defaultCurrency",
      "slug",
      "storeSettings",
      "status",
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

  async rotateJoinCode(_: any, { id }: any, ctx: Ctx) {
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

  async joinClass(_: any, { joinCode }: { joinCode: string }, ctx: Ctx) {
    requireAuth(ctx);
    
    // Find the class by join code
    const cls = await ClassModel.findOne({ joinCode }).lean().exec();
    if (!cls) {
      throw new GraphQLError("Invalid join code");
    }

    const userId = new Types.ObjectId(ctx.userId!);
    const user = await User.findById(userId).lean().exec();
    if (!user) {
      throw new GraphQLError("User not found");
    }

    // Determine role - for now, assume students join classes, teachers are added differently
    const role = user.role === "TEACHER" ? "TEACHER" : "STUDENT";

    // Create or update membership
    await Membership.updateOne(
      { userId, role },
      {
        $setOnInsert: { status: "ACTIVE" },
        $addToSet: { classIds: cls._id },
      },
      { upsert: true }
    ).exec();

    // If this is a student, create their account with starting balance
    if (role === "STUDENT") {
      const existingAccount = await Account.findOne({
        studentId: userId,
        classId: cls._id,
      }).lean().exec();

      if (!existingAccount) {
        const createdAccount = await Account.create({
          studentId: userId,
          classId: cls._id,
          classroomId: cls.classroomId,
        });

        // Add starting balance if specified
        if ((cls.startingBalance ?? 0) > 0) {
          await Transaction.create({
            accountId: createdAccount._id,
            classId: cls._id,
            classroomId: cls.classroomId,
            type: "DEPOSIT",
            amount: cls.startingBalance!,
            memo: "Starting balance",
            createdByUserId: userId,
          });
        }
      }
    }

    return cls;
  },

  async deleteClass(_: any, { id, hard = false }: any, ctx: Ctx) {
    requireAuth(ctx);
    await requireClassTeacher(ctx, id);

    if (!hard) {
      await ClassModel.findByIdAndUpdate(id, {
        $set: { isArchived: true },
      }).exec();
      return true;
    }

    // Update memberships (pull this class from arrays) and remove empties
    await Membership.updateMany(
      { classIds: toId(id) },
      { $pull: { classIds: toId(id) } }
    ).exec();
    // Remove memberships with no classes left
    await Membership.deleteMany({
      $expr: { $eq: [{ $size: { $ifNull: ["$classIds", []] } }, 0] },
    }).exec();

    // HARD DELETE dependents
    await Promise.all([
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

  async createPayRequest(_: any, { input }: any) {
    const reason = await ClassReason.findOne({
      classId: input.classId,
      label: input.reason,
    })
      .lean()
      .exec();
    if (!reason) throw new GraphQLError("Reason not allowed for this class");

    const isMember = await Membership.findOne({
      userId: toId(input.studentId),
      role: "STUDENT",
      classIds: toId(input.classId),
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
      type: mapPayToTxType(),
      amount: req.amount,
      memo: `One-time payment: ${req.reason}`,
      createdByUserId: ctx.userId ? toId(ctx.userId) : req.studentId,
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
    if (!comment?.trim()) throw new GraphQLError("Comment required for rebuke");
    return PayRequest.findByIdAndUpdate(
      id,
      { $set: { status: "REBUKED", teacherComment: comment } },
      { new: true }
    )
      .lean()
      .exec();
  },

  denyPayRequest: (_: any, { id, comment }: { id: string; comment?: string }) =>
    PayRequest.findByIdAndUpdate(
      id,
      { $set: { status: "DENIED", teacherComment: comment ?? null } },
      { new: true }
    )
      .lean()
      .exec(),

  async signUp(_: any, { input }: any, ctx: any) {
    const { name, email, password, role, joinCode } = input;
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

    // If joinCode is provided, join the class
    if (joinCode && joinCode.trim()) {
      try {
        // Find the class by join code
        const cls = await ClassModel.findOne({ joinCode: joinCode.trim() }).lean().exec();
        if (cls) {
          // Create or update membership
          await Membership.updateOne(
            { userId: user._id, role },
            {
              $setOnInsert: { status: "ACTIVE" },
              $addToSet: { classIds: cls._id },
            },
            { upsert: true }
          ).exec();

          // If this is a student, create their account with starting balance
          if (role === "STUDENT") {
            const existingAccount = await Account.findOne({
              studentId: user._id,
              classId: cls._id,
            }).lean().exec();

            if (!existingAccount) {
              const createdAccount = await Account.create({
                studentId: user._id,
                classId: cls._id,
                classroomId: cls.classroomId,
              });

              // Add starting balance if specified
              if ((cls.startingBalance ?? 0) > 0) {
                await Transaction.create({
                  accountId: createdAccount._id,
                  classId: cls._id,
                  classroomId: cls.classroomId,
                  type: "DEPOSIT",
                  amount: cls.startingBalance!,
                  memo: "Starting balance",
                  createdByUserId: user._id,
                });
              }
            }
          }
        }
        // If joinCode is invalid, we'll silently ignore it during signup
        // The user can join a class later
      } catch (error) {
        console.error("Error joining class during signup:", error);
        // Don't fail the signup if joining the class fails
      }
    }

    return { user: user.toObject(), accessToken };
  },

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

  async refreshAccessToken(_: any, __: any, ctx: any) {
    const cookie = ctx.req.cookies?.refresh_token;
    if (!cookie) throw new GraphQLError("No refresh token");
    const { sub, role } = verifyRefreshToken(cookie);
    return signAccessToken(sub, role as any);
  },

  async logout(_: any, __: any, ctx: any) {
    clearRefreshCookie(ctx.res);
    return true;
  },

  // Store item management
  async createStoreItem(_: any, { input }: any, ctx: Ctx) {
    requireAuth(ctx);
    await requireClassTeacher(ctx, input.classId);

    const storeItem = await StoreItem.create({
      classId: toId(input.classId),
      title: input.title,
      price: input.price,
      description: input.description,
      imageUrl: input.imageUrl,
      stock: input.stock,
      perStudentLimit: input.perStudentLimit,
      active: input.active ?? true,
      sort: input.sort ?? 0,
    });

    return storeItem.toObject();
  },

  async updateStoreItem(_: any, { id, input }: any, ctx: Ctx) {
    requireAuth(ctx);
    
    const storeItem = await StoreItem.findById(id).exec();
    if (!storeItem) {
      throw new GraphQLError("Store item not found");
    }

    await requireClassTeacher(ctx, storeItem.classId.toString());

    const updated = await StoreItem.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true }
    ).exec();

    if (!updated) {
      throw new GraphQLError("Failed to update store item");
    }

    return updated.toObject();
  },

  async deleteStoreItem(_: any, { id }: any, ctx: Ctx) {
    requireAuth(ctx);
    
    const storeItem = await StoreItem.findById(id).exec();
    if (!storeItem) {
      throw new GraphQLError("Store item not found");
    }

    await requireClassTeacher(ctx, storeItem.classId.toString());

    await StoreItem.findByIdAndDelete(id).exec();
    return true;
  },

  // Purchase
  async makePurchase(_: any, { input }: any, ctx: Ctx) {
    requireAuth(ctx);
    
    const { classId, items } = input;
    const userId = ctx.userId!;

    // Get student's account for this class
    const account = await Account.findOne({
      studentId: toId(userId),
      classId: toId(classId),
    }).exec();

    if (!account) {
      throw new GraphQLError("Account not found for this class");
    }

    // Calculate current balance
    const balanceResult = await Transaction.aggregate([
      { $match: { accountId: account._id } },
      { $group: { _id: "$accountId", balance: { $sum: "$amount" } } },
    ]).exec();
    const currentBalance = balanceResult[0]?.balance || 0;

    // Validate items and calculate total
    let totalCost = 0;
    const purchaseItems = [];

    for (const item of items) {
      const storeItem = await StoreItem.findById(item.storeItemId).exec();
      if (!storeItem) {
        throw new GraphQLError(`Store item ${item.storeItemId} not found`);
      }

      if (!storeItem.active) {
        throw new GraphQLError(`Store item ${storeItem.title} is not available`);
      }

      if (storeItem.classId.toString() !== classId) {
        throw new GraphQLError(`Store item ${storeItem.title} does not belong to this class`);
      }

      // Check stock
      if (storeItem.stock != null && storeItem.stock < item.quantity) {
        throw new GraphQLError(`Insufficient stock for ${storeItem.title}. Available: ${storeItem.stock}`);
      }

      const itemTotal = storeItem.price * item.quantity;
      totalCost += itemTotal;

      purchaseItems.push({
        storeItem,
        quantity: item.quantity,
        unitPrice: storeItem.price,
        total: itemTotal,
      });
    }

    // Check if student has sufficient balance
    if (currentBalance < totalCost) {
      throw new GraphQLError(`Insufficient balance. Required: CE$ ${totalCost}, Available: CE$ ${currentBalance}`);
    }

    // Create purchases and update stock
    const purchases = [];
    for (const item of purchaseItems) {
      const purchase = await Purchase.create({
        studentId: toId(userId),
        classId: toId(classId),
        accountId: account._id,
        storeItemId: item.storeItem._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      });

      purchases.push(purchase);

      // Update stock if limited
      if (item.storeItem.stock != null) {
        await StoreItem.findByIdAndUpdate(
          item.storeItem._id,
          { $inc: { stock: -item.quantity } }
        ).exec();
      }
    }

    // Create withdrawal transaction
    await Transaction.create({
      accountId: account._id,
      classId: toId(classId),
      classroomId: account.classroomId,
      type: "PURCHASE",
      amount: -totalCost,
      memo: `Store purchase (${purchases.length} items)`,
      createdByUserId: toId(userId),
    });

    return purchases.map(p => p.toObject());
  },
};
async function getOrCreateAccount(studentId: string, classId: string) {
  // Check if account already exists
  const existingAccount = await Account.findOne({
    studentId,
    classId,
  }).exec();

  if (existingAccount) {
    return existingAccount;
  }

  // Get class to find classroom ID
  const cls = await ClassModel.findById(classId).exec();
  if (!cls) {
    throw new GraphQLError("Class not found");
  }

  // Create new account
  const newAccount = await Account.create({
    studentId,
    classId,
    classroomId: cls.classroomId,
  });

  return newAccount;
}

function mapPayToTxType(): TransactionType {
  return "PAYROLL";
}
