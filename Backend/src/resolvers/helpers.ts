import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { Account, ClassModel, type IClass, type IAccount } from "../models";

export type Ctx = { userId?: string | null; role?: string | null };

export const toId = (id: string | Types.ObjectId) =>
  typeof id === "string" ? new Types.ObjectId(id) : id;

export const pickId = (p: any) => (p?.id ?? p?._id)?.toString() ?? null;

export function requireAuth(ctx: Ctx) {
  if (!ctx.userId) throw new GraphQLError("Unauthorized");
}

export function requireTeacher(ctx: Ctx) {
  requireAuth(ctx);
  if (ctx.role !== "TEACHER") throw new GraphQLError("Forbidden");
}

export async function requireClassTeacher(ctx: Ctx, classId: string) {
  requireTeacher(ctx);
  const klass = await ClassModel.findById(classId).lean<IClass | null>().exec();
  if (!klass) throw new GraphQLError("Class not found");
  const teacherIds = (klass.teacherIds ?? []).map((t) => t.toString());
  if (!teacherIds.includes(ctx.userId!)) throw new GraphQLError("Forbidden");
  return klass;
}

export async function assertSelfOrTeacherForStudent(
  ctx: Ctx,
  studentId: string
) {
  requireAuth(ctx);
  if (ctx.userId !== studentId && ctx.role !== "TEACHER")
    throw new GraphQLError("Forbidden");
}

export async function assertAccountAccess(ctx: Ctx, accountId: string) {
  requireAuth(ctx);
  const acct = await Account.findById(accountId).lean<IAccount | null>().exec();
  if (!acct) throw new GraphQLError("Account not found");
  if (ctx.role === "TEACHER") {
    const klass = await ClassModel.findById(acct.classId)
      .lean<IClass | null>()
      .exec();
    if (!klass) throw new GraphQLError("Class not found");
    const teacherIds = (klass.teacherIds ?? []).map((t) => t.toString());
    if (!teacherIds.includes(ctx.userId!)) throw new GraphQLError("Forbidden");
    return acct;
  }
  if (acct.studentId.toString() !== ctx.userId)
    throw new GraphQLError("Forbidden");
  return acct;
}

export function genJoinCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += alphabet[(Math.random() * alphabet.length) | 0];
  return out;
}
