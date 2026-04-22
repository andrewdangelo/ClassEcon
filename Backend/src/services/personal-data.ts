import { Types } from "mongoose";
import { GraphQLError } from "graphql";
import {
  User,
  Membership,
  Account,
  Transaction,
  ClassModel,
  Classroom,
  Subscription,
  PayRequest,
  PayRequestComment,
  Purchase,
  RedemptionRequest,
  JobApplication,
  Employment,
  Payslip,
  Fine,
  Notification,
} from "../models";
import type { IUser } from "../models/User";
import type { Role } from "../utils/enums";

function toOid(id: string) {
  return new Types.ObjectId(id);
}

function stripUserForExport(user: Record<string, unknown> | null) {
  if (!user) return null;
  const { passwordHash: _p, ...rest } = user;
  return rest;
}

export async function buildPersonalDataExport(
  userId: string
): Promise<Record<string, unknown>> {
  const uid = toOid(userId);
  const user = await User.findById(uid).lean();
  if (!user) {
    throw new GraphQLError("User not found");
  }

  const [membership, subscription, notifications, classesTeaching, ownedClassrooms] =
    await Promise.all([
      Membership.find({ userId: uid }).lean(),
      Subscription.find({ userId: uid }).lean(),
      Notification.find({ userId: uid }).lean().limit(1000),
      ClassModel.find({ teacherIds: uid }).select("name schoolName district joinCode").lean(),
      Classroom.find({ ownerId: uid }).select("name settings").lean(),
    ]);

  const [
    accounts,
    payRequests,
    purchases,
    redemptions,
    jobApplications,
    employments,
    payslips,
    fines,
  ] = await Promise.all([
    Account.find({ studentId: uid }).lean(),
    PayRequest.find({ studentId: uid }).lean(),
    Purchase.find({ studentId: uid }).lean(),
    RedemptionRequest.find({ studentId: uid }).lean(),
    JobApplication.find({ studentId: uid }).lean(),
    Employment.find({ studentId: uid }).lean(),
    Payslip.find({ studentId: uid }).lean(),
    Fine.find({ studentId: uid }).lean(),
  ]);

  const accountIds = accounts.map((a) => a._id);
  const transactions =
    accountIds.length > 0
      ? await Transaction.find({
          $or: [
            { accountId: { $in: accountIds } },
            { toAccountId: { $in: accountIds } },
          ],
        })
          .lean()
          .limit(5000)
      : [];
  const createdByTx = await Transaction.find({ createdByUserId: uid })
    .lean()
    .limit(2000);
  const prIds = payRequests.map((p) => p._id);
  const payRequestComments = prIds.length
    ? await PayRequestComment.find({ payRequestId: { $in: prIds } }).lean()
    : [];
  const commentsByUser = await PayRequestComment.find({ userId: uid }).lean();

  return {
    exportedAt: new Date().toISOString(),
    user: stripUserForExport(
      user as unknown as Record<string, unknown> & { passwordHash?: string }
    ),
    memberships: membership,
    subscriptionPlans: subscription,
    notifications: notifications,
    classTeacherAssignments: classesTeaching,
    ownedClassrooms,
    studentRecords: {
      accounts,
      transactionsForAccounts: transactions,
      transactionsCreatedByThisUser: createdByTx,
      payRequests,
      payRequestComments,
      payRequestCommentsAuthored: commentsByUser,
      purchases,
      redemptions,
      jobApplications,
      employments,
      payslips,
      fines,
    },
  };
}

const CONFIRM_DELETE = "DELETE MY ACCOUNT";

function assertNotAdmin(user: IUser) {
  if (user.role === "ADMIN") {
    throw new GraphQLError(
      "Admin accounts must be removed by another administrator."
    );
  }
}

async function assertNoTeachingObligations(userId: string) {
  const uid = toOid(userId);
  const [asOwner, asTeacher] = await Promise.all([
    Classroom.countDocuments({ ownerId: uid }),
    ClassModel.countDocuments({ teacherIds: uid }),
  ]);
  if (asOwner > 0 || asTeacher > 0) {
    throw new GraphQLError(
      "You are still listed as a classroom owner or class teacher. Transfer ownership, remove yourself from class staff, or delete those classes, then try again. You can also contact support@classecon.com for help."
    );
  }
}

/** When true, also removes all student-economy records (accounts, class activity) for this user id. */
async function deleteUserCoreRecords(
  userId: string,
  includeStudentEconomicData: boolean
) {
  const uid = toOid(userId);

  if (includeStudentEconomicData) {
    const prIds = await PayRequest.find({ studentId: uid }).distinct("_id");
    if (prIds.length) {
      await PayRequestComment.deleteMany({ payRequestId: { $in: prIds } });
    }
    await PayRequest.deleteMany({ studentId: uid });
    await RedemptionRequest.deleteMany({ studentId: uid });
    await Purchase.deleteMany({ studentId: uid });
    await JobApplication.deleteMany({ studentId: uid });
    await Employment.deleteMany({ studentId: uid });
    await Payslip.deleteMany({ studentId: uid });
    await Fine.deleteMany({ studentId: uid });
    const accounts = await Account.find({ studentId: uid }).select("_id").lean();
    const accountIds = accounts.map((a) => a._id);
    if (accountIds.length) {
      await Transaction.deleteMany({
        $or: [
          { accountId: { $in: accountIds } },
          { toAccountId: { $in: accountIds } },
        ],
      });
    }
    await Account.deleteMany({ studentId: uid });
  }

  await PayRequestComment.deleteMany({ userId: uid });
  await Transaction.deleteMany({ createdByUserId: uid });
  await Notification.deleteMany({ userId: uid });
  await Membership.deleteMany({ userId: uid });
  await Subscription.deleteMany({ userId: uid });
  await User.deleteOne({ _id: uid });
}

/** Self-service account deletion: GDPR/FERPA-aligned purge for learners; stricter rules for staff. */
export async function performSelfServiceAccountDeletion(
  userId: string,
  confirmationPhrase: string
) {
  if (confirmationPhrase !== CONFIRM_DELETE) {
    throw new GraphQLError(
      `Type exactly "${CONFIRM_DELETE}" to confirm account deletion.`
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new GraphQLError("User not found");
  }

  assertNotAdmin(user);

  const role = user.role as Role;

  if (role === "TEACHER" || role === "PARENT") {
    await assertNoTeachingObligations(userId);
  }

  if (role === "TEACHER" || role === "PARENT") {
    await deleteUserCoreRecords(userId, false);
    return;
  }

  if (role === "STUDENT") {
    await deleteUserCoreRecords(userId, true);
    return;
  }

  throw new GraphQLError("Unsupported account type for self-service deletion.");
}
