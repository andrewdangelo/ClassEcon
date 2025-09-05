import { Types } from "mongoose";
import { Transaction } from "../models";

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
