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
  PayRequestComment,
  Notification,
  RedemptionRequest,
} from "../models";
import {
  requireAuth,
  requireTeacher,
  requireClassTeacher,
  toId,
  genJoinCode,
  Ctx,
} from "./helpers";
import { createPayRequestNotification, createRedemptionNotification } from "../services/notifications";
import { authClient } from "../services/auth-client";
import { TransactionType } from "../utils/enums";
import { Types } from "mongoose";
import { pubsub, PAY_REQUEST_EVENTS } from "../pubsub";

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

  async createPayRequest(_: any, { input }: any, ctx: Ctx) {
    requireAuth(ctx);
    
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

    // Get class to find teachers
    const cls = await ClassModel.findById(input.classId).lean().exec();
    if (!cls) throw new GraphQLError("Class not found");

    const created = await PayRequest.create({
      classId: toId(input.classId),
      studentId: toId(input.studentId),
      amount: input.amount,
      reason: input.reason,
      justification: input.justification,
      status: "SUBMITTED",
    });

    const result = created.toObject();

    // Publish subscription event
    pubsub.publish(PAY_REQUEST_EVENTS.PAY_REQUEST_CREATED, {
      payRequestCreated: result,
    });

    // Send notifications to teachers
    await createPayRequestNotification(result, cls.teacherIds || [], "submitted");

    return result;
  },

  async approvePayRequest(
    _: any,
    { id, amount, comment }: { id: string; amount: number; comment?: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);
    
    const req = await PayRequest.findById(id).exec();
    if (!req) throw new GraphQLError("Request not found");
    
    await requireClassTeacher(ctx, req.classId.toString());

    // Get student's account to verify it exists
    const account = await Account.findOne({
      studentId: req.studentId,
      classId: req.classId,
    }).exec();

    if (!account) {
      throw new GraphQLError("Student account not found");
    }

    // NOTE: Transaction is NOT created here - it's only created when actually paying in submitPayRequest
    // This prevents double payment issue where approving AND paying both created transactions

    const updated = await PayRequest.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: "APPROVED", 
          teacherComment: comment ?? null,
          amount: amount // Update the amount to approved amount
        } 
      },
      { new: true }
    ).exec();

    if (!updated) throw new GraphQLError("Failed to approve request");

    // Publish subscription event
    pubsub.publish(PAY_REQUEST_EVENTS.PAY_REQUEST_STATUS_CHANGED, {
      payRequestStatusChanged: updated.toObject(),
    });

    // Notify student of approval
    await createPayRequestNotification(updated.toObject(), [], "approved");

    return updated.toObject();
  },

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

    // Notify student that payment is complete
    if (updated) {
      await createPayRequestNotification(updated, [], "paid");
    }

    return updated;
  },

  async rebukePayRequest(
    _: any,
    { id, comment }: { id: string; comment: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);
    
    if (!comment?.trim()) throw new GraphQLError("Comment required for rebuke");
    
    const req = await PayRequest.findById(id).exec();
    if (!req) throw new GraphQLError("Request not found");
    
    await requireClassTeacher(ctx, req.classId.toString());

    const updated = await PayRequest.findByIdAndUpdate(
      id,
      { $set: { status: "REBUKED", teacherComment: comment } },
      { new: true }
    ).exec();

    if (!updated) throw new GraphQLError("Failed to rebuke request");

    // Publish subscription event
    pubsub.publish(PAY_REQUEST_EVENTS.PAY_REQUEST_STATUS_CHANGED, {
      payRequestStatusChanged: updated.toObject(),
    });

    // Notify student that request needs revision
    await createPayRequestNotification(updated.toObject(), [], "rebuked");

    return updated.toObject();
  },

  async denyPayRequest(
    _: any, 
    { id, comment }: { id: string; comment: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);
    
    if (!comment?.trim()) throw new GraphQLError("Comment required for denial");
    
    const req = await PayRequest.findById(id).exec();
    if (!req) throw new GraphQLError("Request not found");
    
    await requireClassTeacher(ctx, req.classId.toString());

    const updated = await PayRequest.findByIdAndUpdate(
      id,
      { $set: { status: "DENIED", teacherComment: comment } },
      { new: true }
    ).exec();

    if (!updated) throw new GraphQLError("Failed to deny request");

    // Publish subscription event
    pubsub.publish(PAY_REQUEST_EVENTS.PAY_REQUEST_STATUS_CHANGED, {
      payRequestStatusChanged: updated.toObject(),
    });

    // Notify student of denial
    await createPayRequestNotification(updated.toObject(), [], "denied");

    return updated.toObject();
  },

  async signUp(_: any, { input }: any, ctx: any) {
    const { name, email, password, role, joinCode } = input;
    const existing = await User.findOne({ email: email.toLowerCase() })
      .lean()
      .exec();
    if (existing) throw new GraphQLError("Email already in use");

    const passwordHash = await authClient.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    const tokens = await authClient.signTokens(user._id.toString(), role, ctx.res);
    const accessToken = tokens.accessToken;

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
    const ok = await authClient.verifyPassword(password, (user as any).passwordHash);
    if (!ok) throw new GraphQLError("Invalid credentials");

    const tokens = await authClient.signTokens(user._id.toString(), user.role, ctx.res);

    return { user, accessToken: tokens.accessToken };
  },

  async oauthLogin(_: any, { provider, code }: any, ctx: any) {
    try {
      // Call Auth Service to exchange OAuth code for user info
      const response = await authClient.request<{
        userInfo: {
          id: string;
          email: string;
          name: string;
          picture?: string;
          provider: "google" | "microsoft";
        };
      }>(`/oauth/${provider.toLowerCase()}`, "POST", { code });

      const { userInfo } = response;
      if (!userInfo || !userInfo.email) {
        throw new GraphQLError("Failed to get user info from OAuth provider");
      }

      // Find or create user with OAuth provider ID
      let user = await User.findOne({ email: userInfo.email.toLowerCase() }).exec();

      if (!user) {
        // Create new user - default to STUDENT role, no classroom yet
        // Teacher/Parent needs to be manually upgraded or use invite flow
        user = await User.create({
          email: userInfo.email.toLowerCase(),
          name: userInfo.name,
          role: "STUDENT",
          status: "ACTIVE",
          passwordHash: null, // OAuth users don't have password
          oauthProvider: userInfo.provider,
          oauthProviderId: userInfo.id,
          profilePicture: userInfo.picture,
        });
      } else {
        // Update existing user's OAuth info if not already set
        if (!user.oauthProvider) {
          user.oauthProvider = userInfo.provider;
          user.oauthProviderId = userInfo.id;
          if (userInfo.picture && !user.profilePicture) {
            user.profilePicture = userInfo.picture;
          }
          await user.save();
        }
      }

      // Generate JWT tokens
      const tokens = await authClient.signTokens(user._id.toString(), user.role, ctx.res);

      return { user: user.toObject(), accessToken: tokens.accessToken };
    } catch (error: any) {
      console.error("OAuth login error:", error);
      throw new GraphQLError(error.message || "OAuth authentication failed");
    }
  },

  async refreshAccessToken(_: any, __: any, ctx: any) {
    const cookie = ctx.req.cookies?.refresh_token;
    if (!cookie) throw new GraphQLError("No refresh token");
    const payload = await authClient.verifyRefreshToken(cookie);
    const tokens = await authClient.signTokens(payload.sub, payload.role);
    return tokens.accessToken;
  },

  async logout(_: any, __: any, ctx: any) {
    authClient.clearRefreshCookie(ctx.res);
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

  // Pay request comments
  async addPayRequestComment(_: any, { payRequestId, content }: any, ctx: Ctx) {
    requireAuth(ctx);
    
    const payRequest = await PayRequest.findById(payRequestId).exec();
    if (!payRequest) {
      throw new GraphQLError("Pay request not found");
    }

    // Check if user is either the student who made the request or a teacher of the class
    const userId = ctx.userId!;
    const isStudent = payRequest.studentId.toString() === userId;
    let isTeacher = false;
    
    if (!isStudent) {
      // Check if user is a teacher for this class
      const membership = await Membership.findOne({
        userId: toId(userId),
        role: "TEACHER",
        classIds: payRequest.classId,
      }).exec();
      isTeacher = !!membership;
    }

    if (!isStudent && !isTeacher) {
      throw new GraphQLError("You can only comment on your own requests or requests from your classes");
    }

    const comment = await PayRequestComment.create({
      payRequestId: toId(payRequestId),
      userId: toId(userId),
      content: content.trim(),
    });

    const result = comment.toObject();

    // Publish subscription event
    pubsub.publish(PAY_REQUEST_EVENTS.PAY_REQUEST_COMMENT_ADDED, {
      payRequestCommentAdded: result,
    });

    return result;
  },

  // Reason management
  async addReasons(_: any, { classId, labels }: any, ctx: Ctx) {
    requireAuth(ctx);
    await requireClassTeacher(ctx, classId);

    const docs = labels.map((label: string) => ({ 
      classId: toId(classId), 
      label: label.trim() 
    }));

    try {
      await ClassReason.insertMany(docs, { ordered: false });
    } catch {
      // ignore duplicate key errors
    }

    return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
  },

  async setReasons(_: any, { classId, labels }: any, ctx: Ctx) {
    requireAuth(ctx);
    await requireClassTeacher(ctx, classId);

    // Delete all existing reasons for this class
    await ClassReason.deleteMany({ classId }).exec();

    // Add new reasons if any provided
    if (labels && labels.length > 0) {
      const docs = labels.map((label: string) => ({ 
        classId: toId(classId), 
        label: label.trim() 
      }));

      await ClassReason.insertMany(docs, { ordered: false });
    }

    return ClassReason.find({ classId }).sort({ label: 1 }).lean().exec();
  },

  // Notification management
  async markNotificationAsRead(_: any, { id }: { id: string }, ctx: Ctx) {
    requireAuth(ctx);
    
    const notification = await Notification.findById(id).exec();
    if (!notification) throw new GraphQLError("Notification not found");
    
    // Ensure user can only mark their own notifications
    if (notification.userId.toString() !== ctx.userId) {
      throw new GraphQLError("Unauthorized");
    }

    notification.isRead = true;
    await notification.save();

    return notification.toObject();
  },

  async markAllNotificationsAsRead(_: any, __: any, ctx: Ctx) {
    requireAuth(ctx);
    
    await Notification.updateMany(
      { userId: toId(ctx.userId!), isRead: false },
      { $set: { isRead: true } }
    ).exec();

    return true;
  },

  async clearAllNotifications(_: any, __: any, ctx: Ctx) {
    requireAuth(ctx);
    
    await Notification.deleteMany({ userId: toId(ctx.userId!) }).exec();

    return true;
  },

  // Redemption system
  async createRedemptionRequest(
    _: any,
    { purchaseId, studentNote }: { purchaseId: string; studentNote: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);
    
    // Validate studentNote is provided and not empty
    if (!studentNote || !studentNote.trim()) {
      throw new GraphQLError("Student note is required - please explain what you intend to use this item for");
    }
    
    const purchase = await Purchase.findById(purchaseId).exec();
    if (!purchase) throw new GraphQLError("Purchase not found");
    
    // Ensure the purchase belongs to the current user
    if (purchase.studentId.toString() !== ctx.userId) {
      throw new GraphQLError("Unauthorized - this purchase doesn't belong to you");
    }

    // Check if purchase is eligible for redemption
    if (purchase.status !== "in-backpack") {
      throw new GraphQLError(`Cannot redeem item with status: ${purchase.status}`);
    }

    // Check if there's already a pending redemption request
    const existingRequest = await RedemptionRequest.findOne({
      purchaseId: toId(purchaseId),
      status: "pending",
    }).exec();

    if (existingRequest) {
      throw new GraphQLError("A redemption request for this item is already pending");
    }

    // Create redemption request
    const redemptionRequest = await RedemptionRequest.create({
      purchaseId: toId(purchaseId),
      studentId: purchase.studentId,
      classId: purchase.classId,
      status: "pending",
      studentNote: studentNote.trim(),
    });

    // Get storeItem and teacher IDs for notifications
    const storeItem = await StoreItem.findById(purchase.storeItemId).exec();
    const teacherMemberships = await Membership.find({
      classId: purchase.classId,
      role: "teacher",
    }).exec();
    const teacherIds = teacherMemberships.map((m) => m.userId);

    // Notify teachers
    await createRedemptionNotification(
      redemptionRequest,
      purchase,
      storeItem,
      teacherIds,
      "submitted"
    );

    return redemptionRequest.toObject();
  },

  async approveRedemption(
    _: any,
    { id, teacherComment }: { id: string; teacherComment: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);
    
    const request = await RedemptionRequest.findById(id).exec();
    if (!request) throw new GraphQLError("Redemption request not found");
    
    await requireClassTeacher(ctx, request.classId.toString());

    if (request.status !== "pending") {
      throw new GraphQLError(`Cannot approve request with status: ${request.status}`);
    }

    // Update redemption request
    request.status = "approved";
    request.teacherComment = teacherComment;
    request.reviewedByUserId = toId(ctx.userId!);
    request.reviewedAt = new Date();
    await request.save();

    // Update the purchase to mark it as redeemed
    const purchase = await Purchase.findByIdAndUpdate(
      request.purchaseId,
      {
        $set: {
          status: "redeemed",
          redemptionDate: new Date(),
          redemptionNote: teacherComment,
        },
      },
      { new: true }
    ).exec();

    // Get storeItem for notification
    const storeItem = await StoreItem.findById(purchase!.storeItemId).exec();

    // Notify student
    await createRedemptionNotification(
      request,
      purchase,
      storeItem,
      [],
      "approved"
    );

    return request.toObject();
  },

  async denyRedemption(
    _: any,
    { id, teacherComment }: { id: string; teacherComment: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);
    
    const request = await RedemptionRequest.findById(id).exec();
    if (!request) throw new GraphQLError("Redemption request not found");
    
    await requireClassTeacher(ctx, request.classId.toString());

    if (request.status !== "pending") {
      throw new GraphQLError(`Cannot deny request with status: ${request.status}`);
    }

    // Update redemption request
    request.status = "denied";
    request.teacherComment = teacherComment;
    request.reviewedByUserId = toId(ctx.userId!);
    request.reviewedAt = new Date();
    await request.save();

    // Get purchase and storeItem for notification
    const purchase = await Purchase.findById(request.purchaseId).exec();
    const storeItem = await StoreItem.findById(purchase!.storeItemId).exec();

    // Notify student
    await createRedemptionNotification(
      request,
      purchase,
      storeItem,
      [],
      "denied"
    );

    // Purchase remains in backpack when denied
    return request.toObject();
  },

  // Job management mutations
  async createJob(_: any, { input }: any, ctx: Ctx) {
    requireAuth(ctx);
    await requireClassTeacher(ctx, input.classId);

    const job = await Job.create({
      classId: toId(input.classId),
      title: input.title,
      description: input.description,
      rolesResponsibilities: input.rolesResponsibilities,
      salary: {
        amount: input.salary,
        unit: input.salaryUnit || "FIXED",
      },
      period: input.period,
      capacity: {
        current: 0,
        max: input.maxCapacity || 1,
      },
      active: input.active !== false,
    });

    // Notify students about new job posting
    const { createJobPostedNotification } = await import("../services/notifications");
    await createJobPostedNotification(job);

    return job.toObject();
  },

  async updateJob(_: any, { id, input }: any, ctx: Ctx) {
    requireAuth(ctx);

    const job = await Job.findById(id).exec();
    if (!job) throw new GraphQLError("Job not found");

    await requireClassTeacher(ctx, job.classId.toString());

    // Update fields
    if (input.title !== undefined) job.title = input.title;
    if (input.description !== undefined) job.description = input.description;
    if (input.rolesResponsibilities !== undefined) job.rolesResponsibilities = input.rolesResponsibilities;
    if (input.salary !== undefined) job.salary.amount = input.salary;
    if (input.salaryUnit !== undefined) job.salary.unit = input.salaryUnit;
    if (input.period !== undefined) job.period = input.period;
    if (input.maxCapacity !== undefined) job.capacity.max = input.maxCapacity;
    if (input.active !== undefined) job.active = input.active;

    await job.save();
    return job.toObject();
  },

  async deleteJob(_: any, { id }: { id: string }, ctx: Ctx) {
    requireAuth(ctx);

    const job = await Job.findById(id).exec();
    if (!job) throw new GraphQLError("Job not found");

    await requireClassTeacher(ctx, job.classId.toString());

    // Check if there are active employments
    const activeEmployments = await Employment.countDocuments({
      jobId: toId(id),
      status: "ACTIVE",
    }).exec();

    if (activeEmployments > 0) {
      throw new GraphQLError(
        "Cannot delete job with active employments. End employments first."
      );
    }

    await Job.findByIdAndDelete(id).exec();
    return true;
  },

  // Job application mutations
  async applyForJob(_: any, { input }: any, ctx: Ctx) {
    requireAuth(ctx);
    const userId = ctx.userId!;

    const job = await Job.findById(input.jobId).exec();
    if (!job) throw new GraphQLError("Job not found");

    if (!job.active) {
      throw new GraphQLError("This job is no longer accepting applications");
    }

    // Check if student is in the class
    console.log("DEBUG applyForJob - checking membership:", {
      userId: toId(userId),
      role: "STUDENT",
      jobClassId: job.classId,
      jobClassIdType: typeof job.classId,
    });
    
    const membership = await Membership.findOne({
      userId: toId(userId),
      role: "STUDENT",
      classIds: job.classId,
    }).lean().exec();

    console.log("DEBUG applyForJob - membership result:", membership);

    if (!membership) {
      // Let's also check what memberships exist for this user
      const allUserMemberships = await Membership.find({
        userId: toId(userId),
      }).lean().exec();
      console.log("DEBUG applyForJob - all user memberships:", JSON.stringify(allUserMemberships, null, 2));
      
      throw new GraphQLError("You must be a student in this class to apply");
    }

    // Check if already applied
    const existingApp = await JobApplication.findOne({
      jobId: toId(input.jobId),
      studentId: toId(userId),
      status: { $in: ["PENDING", "APPROVED"] },
    }).lean().exec();

    if (existingApp) {
      throw new GraphQLError("You have already applied for this job");
    }

    // Check if already employed in this job
    const existingEmployment = await Employment.findOne({
      jobId: toId(input.jobId),
      studentId: toId(userId),
      status: "ACTIVE",
    }).lean().exec();

    if (existingEmployment) {
      throw new GraphQLError("You are already employed in this job");
    }

    const application = await JobApplication.create({
      jobId: toId(input.jobId),
      classId: job.classId,
      studentId: toId(userId),
      status: "PENDING",
      applicationText: input.applicationText,
      qualifications: input.qualifications,
      availability: input.availability,
    });

    // Notify teachers
    const { createJobApplicationNotification } = await import("../services/notifications");
    await createJobApplicationNotification(application, job);

    return application.toObject();
  },

  async approveJobApplication(_: any, { id }: { id: string }, ctx: Ctx) {
    requireAuth(ctx);

    const application = await JobApplication.findById(id).exec();
    if (!application) throw new GraphQLError("Application not found");

    await requireClassTeacher(ctx, application.classId.toString());

    if (application.status !== "PENDING") {
      throw new GraphQLError(`Cannot approve application with status: ${application.status}`);
    }

    const job = await Job.findById(application.jobId).exec();
    if (!job) throw new GraphQLError("Job not found");

    // Check capacity
    if (job.capacity.current >= job.capacity.max) {
      throw new GraphQLError("Job is at full capacity");
    }

    // Create employment
    const employment = await Employment.create({
      jobId: application.jobId,
      classId: application.classId,
      studentId: application.studentId,
      status: "ACTIVE",
      startedAt: new Date(),
    });

    // Update application
    application.status = "APPROVED";
    application.decidedAt = new Date();
    await application.save();

    // Update job capacity
    job.capacity.current += 1;
    await job.save();

    // Notify student
    const { createJobApprovalNotification } = await import("../services/notifications");
    await createJobApprovalNotification(application, job, true);

    return application.toObject();
  },

  async rejectJobApplication(
    _: any,
    { id, reason }: { id: string; reason?: string },
    ctx: Ctx
  ) {
    requireAuth(ctx);

    const application = await JobApplication.findById(id).exec();
    if (!application) throw new GraphQLError("Application not found");

    await requireClassTeacher(ctx, application.classId.toString());

    if (application.status !== "PENDING") {
      throw new GraphQLError(`Cannot reject application with status: ${application.status}`);
    }

    application.status = "REJECTED";
    application.decidedAt = new Date();
    await application.save();

    // Notify student
    const job = await Job.findById(application.jobId).exec();
    if (job) {
      const { createJobApprovalNotification } = await import("../services/notifications");
      await createJobApprovalNotification(application, job, false, reason);
    }

    return application.toObject();
  },

  async withdrawJobApplication(_: any, { id }: { id: string }, ctx: Ctx) {
    requireAuth(ctx);
    const userId = ctx.userId!;

    const application = await JobApplication.findById(id).exec();
    if (!application) throw new GraphQLError("Application not found");

    if (application.studentId.toString() !== userId) {
      throw new GraphQLError("You can only withdraw your own applications");
    }

    if (application.status !== "PENDING") {
      throw new GraphQLError("Can only withdraw pending applications");
    }

    application.status = "WITHDRAWN";
    await application.save();

    return application.toObject();
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
