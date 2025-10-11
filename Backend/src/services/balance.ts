import { Types } from "mongoose";
import { Transaction, Account } from "../models";

export async function computeAccountBalance(accountId: Types.ObjectId) {
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
                  case: {
                    $in: [
                      "$type",
                      ["DEPOSIT", "REFUND", "PAYROLL", "TRANSFER_CREDIT"],
                    ],
                  },
                  then: "$amount",
                },
                {
                  case: {
                    $in: [
                      "$type",
                      ["WITHDRAWAL", "PURCHASE", "FINE", "TRANSFER_DEBIT"],
                    ],
                  },
                  then: { $multiply: [-1, "$amount"] },
                },
                { case: { $eq: ["$type", "ADJUSTMENT"] }, then: "$amount" },
              ],
              default: 0,
            },
          },
        },
      },
    },
  ]);
  return res[0]?.balance ?? 0;
}

/**
 * Add balance to a user's account for a specific class by creating a transaction
 * Note: Balance is computed from transactions, not stored directly on Account
 */
export async function addToBalance(params: {
  userId: Types.ObjectId;
  classId: Types.ObjectId;
  amount: number;
}) {
  const { userId, classId } = params;

  // Find or create account - balance is computed from transactions
  let account = await Account.findOne({ studentId: userId, classId }).exec();
  
  if (!account) {
    // Need to get classroom ID for account creation
    const { ClassModel } = await import("../models");
    const classDoc = await ClassModel.findById(classId).lean().exec();
    if (!classDoc) {
      throw new Error("Class not found");
    }
    account = await Account.create({ 
      studentId: userId, 
      classId, 
      classroomId: classDoc.classroomId 
    });
  }

  return account;
}
