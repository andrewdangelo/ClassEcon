// scripts/wipe.ts
import "dotenv/config";
import { connectMongo } from "../src/db/connection";
import {
  User,
  Classroom,
  ClassModel,
  Membership,
  Account,
  StoreItem,
  Job,
  ClassReason,
  PayRequest,
  Transaction,
} from "../src/models";

async function wipe() {
  await connectMongo(process.env.DATABASE_URL!);
  await Promise.all([
    User.deleteMany({}),
    Classroom.deleteMany({}),
    ClassModel.deleteMany({}),
    Membership.deleteMany({}),
    Account.deleteMany({}),
    StoreItem.deleteMany({}),
    Job.deleteMany({}),
    ClassReason.deleteMany({}),
    PayRequest.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  console.log("🧹 wiped core collections");
  process.exit(0);
}
wipe();
