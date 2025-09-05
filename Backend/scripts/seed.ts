/* scripts/seed.ts
 * Seed Classroom Economy data (idempotent).
 * Run with:
 *   ts-node --swc scripts/seed.ts
 * or (JS build):
 *   node dist/scripts/seed.js
 */

import "dotenv/config";
import { Types } from "mongoose";
import { connectMongo } from "../src/db/connection.ts";
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
} from "../src/models/index.ts";


type Role = "TEACHER" | "STUDENT" | "PARENT";
const toId = (id: string) => new Types.ObjectId(id);

// -------- Helpers ------------------------------------------------------------

async function getOrCreateUser(props: {
  role: Role;
  name: string;
  email?: string | null;
}) {
  if (props.email) {
    const found = await User.findOne({ email: props.email }).lean();
    if (found) return found;
    const created = await User.create({
      role: props.role,
      name: props.name,
      email: props.email,
    });
    return created.toObject();
  } else {
    // no email: find by role+name
    const found = await User.findOne({
      role: props.role,
      name: props.name,
    }).lean();
    if (found) return found;
    const created = await User.create({ role: props.role, name: props.name });
    return created.toObject();
  }
}

async function ensureClassroom(props: {
  name: string;
  ownerId: string;
  currency?: string;
}) {
  const existing = await Classroom.findOne({
    name: props.name,
    ownerId: props.ownerId,
  }).lean();
  if (existing) return existing;
  const created = await Classroom.create({
    name: props.name,
    ownerId: toId(props.ownerId),
    settings: {
      currency: props.currency ?? "CE$",
      overdraft: 0,
      transferAcrossClasses: false,
    },
  });
  return created.toObject();
}

async function ensureClass(props: {
  classroomId: string;
  name: string;
  slug?: string;
  period?: string | null;
  subject?: string | null;
  teacherIds?: string[];
}) {
  const where: any = { classroomId: props.classroomId, name: props.name };
  if (props.slug) where.slug = props.slug;

  const existing = await ClassModel.findOne(where).lean();
  if (existing) return existing;

  const created = await ClassModel.create({
    classroomId: toId(props.classroomId),
    name: props.name,
    slug: props.slug,
    period: props.period ?? null,
    subject: props.subject ?? null,
    teacherIds: (props.teacherIds || []).map(toId),
  });
  return created.toObject();
}

async function ensureMembership(userId: string, classId: string, role: Role) {
  await Membership.updateOne(
    { userId, classId, role },
    { $setOnInsert: { status: "ACTIVE" } },
    { upsert: true }
  );
}

async function ensureAccount(
  studentId: string,
  classId: string,
  classroomId: string
) {
  const found = await Account.findOne({ studentId, classId }).lean();
  if (found) return found;
  const created = await Account.create({
    studentId: toId(studentId),
    classId: toId(classId),
    classroomId: toId(classroomId),
  });
  return created.toObject();
}

async function ensureClassReasons(classId: string, labels: string[]) {
  const docs = labels.map((label) => ({ classId: toId(classId), label }));
  try {
    await ClassReason.insertMany(docs, { ordered: false });
  } catch {
    // ignore duplicate key errors
  }
  return ClassReason.find({ classId }).sort({ label: 1 }).lean();
}

async function seedStoreItems(classId: string) {
  const items = [
    {
      title: "Homework Pass",
      price: 150,
      description: "Skip one homework assignment",
      stock: 5,
      sort: 10,
    },
    {
      title: "Snack Ticket",
      price: 100,
      description: "One snack at break",
      stock: 20,
      sort: 20,
    },
    {
      title: "Desk Buddy (1 day)",
      price: 80,
      description: "Sit with a friend for a day",
      stock: null,
      sort: 30,
    },
  ];
  // Upsert-like: insert many and ignore duplicates
  try {
    await StoreItem.insertMany(
      items.map((i) => ({
        classId: toId(classId),
        active: true,
        perStudentLimit: null,
        imageUrl: null,
        ...i,
      })),
      { ordered: false }
    );
  } catch {}
  return StoreItem.find({ classId }).lean();
}

async function seedJobs(classId: string) {
  const jobs = [
    {
      title: "Line Leader",
      description: "Lead the class line",
      salary: { amount: 50, unit: "FIXED" },
      period: "WEEKLY",
      capacity: { current: 0, max: 1 },
      active: true,
    },
    {
      title: "Board Cleaner",
      description: "Erase the board daily",
      salary: { amount: 30, unit: "FIXED" },
      period: "WEEKLY",
      capacity: { current: 0, max: 2 },
      active: true,
    },
  ];
  try {
    await Job.insertMany(
      jobs.map((j) => ({ classId: toId(classId), ...j })),
      { ordered: false }
    );
  } catch {}
  return Job.find({ classId }).lean();
}

async function postTransaction(params: {
  accountId: string;
  classId: string;
  classroomId: string;
  type:
    | "DEPOSIT"
    | "WITHDRAWAL"
    | "ADJUSTMENT"
    | "PURCHASE"
    | "REFUND"
    | "PAYROLL"
    | "FINE";
  amount: number;
  memo?: string;
  createdByUserId: string;
  idempotencyKey?: string;
}) {
  try {
    await Transaction.create({
      accountId: toId(params.accountId),
      classId: toId(params.classId),
      classroomId: toId(params.classroomId),
      type: params.type,
      amount: params.amount,
      memo: params.memo,
      createdByUserId: toId(params.createdByUserId),
      idempotencyKey: params.idempotencyKey,
    });
  } catch (e: any) {
    // swallow duplicate idempotencyKey errors
    if (!String(e?.message || "").includes("duplicate key error")) throw e;
  }
}

function ikey(...parts: Array<string | number>) {
  return parts.join(":");
}

// -------- Main Seed ----------------------------------------------------------

async function run() {
  await connectMongo(process.env.DATABASE_URL!);

  // 1) Users
  const teacher = await getOrCreateUser({
    role: "TEACHER",
    name: "Ms. Carter",
    email: "teacher+carter@demo.school",
  });
  const teacher2 = await getOrCreateUser({
    role: "TEACHER",
    name: "Mr. Lee",
    email: "teacher+lee@demo.school",
  });

  const students = await Promise.all(
    ["Ava", "Liam", "Noah", "Olivia", "Mason", "Sophia"].map((name) =>
      getOrCreateUser({ role: "STUDENT", name })
    )
  );

  // 2) Classroom
  const classroom = await ensureClassroom({
    name: "Room 204 – Fall",
    ownerId: teacher._id.toString(),
    currency: "CE$",
  });

  // 3) Class (within classroom)
  const klass = await ensureClass({
    classroomId: classroom._id.toString(),
    name: "Economics Fundamentals",
    slug: "econ-fundamentals",
    period: "Fall",
    subject: "Economics",
    teacherIds: [teacher._id.toString(), teacher2._id.toString()],
  });

  // 4) Memberships (students in class) + Accounts
  for (const s of students) {
    await ensureMembership(s._id.toString(), klass._id.toString(), "STUDENT");
    await ensureAccount(
      s._id.toString(),
      klass._id.toString(),
      classroom._id.toString()
    );
  }
  // teachers as class members
  await ensureMembership(
    teacher._id.toString(),
    klass._id.toString(),
    "TEACHER"
  );
  await ensureMembership(
    teacher2._id.toString(),
    klass._id.toString(),
    "TEACHER"
  );

  // 5) Reasons
  await ensureClassReasons(klass._id.toString(), [
    "Great Participation",
    "Outstanding Project",
    "Helping Others",
    "Missed Homework",
    "Late to Class",
  ]);

  // 6) Store Items & Jobs
  await seedStoreItems(klass._id.toString());
  await seedJobs(klass._id.toString());

  // 7) Seed some balances via transactions (PAYROLL + FINES)
  for (const s of students) {
    const acct = await Account.findOne({
      studentId: s._id,
      classId: klass._id,
    }).lean();
    if (!acct) continue;

    // PAYROLL (weekly allowance)
    await postTransaction({
      accountId: acct._id.toString(),
      classId: klass._id.toString(),
      classroomId: classroom._id.toString(),
      type: "PAYROLL",
      amount: 200,
      memo: "Weekly allowance",
      createdByUserId: teacher._id.toString(),
      idempotencyKey: ikey("seed", "payroll", acct._id.toString(), 1),
    });

    // occasional fine
    await postTransaction({
      accountId: acct._id.toString(),
      classId: klass._id.toString(),
      classroomId: classroom._id.toString(),
      type: "FINE",
      amount: 20,
      memo: "Late to class",
      createdByUserId: teacher2._id.toString(),
      idempotencyKey: ikey("seed", "fine", acct._id.toString(), 1),
    });
  }

  // 8) A couple of Pay Requests (one paid, one pending)
  const s0 = students[0];
  const s1 = students[1];

  // submitted + paid
  const pr1 = await PayRequest.findOne({
    classId: klass._id,
    studentId: s0._id,
    justification: "Helped organize materials",
  }).lean();
  if (!pr1) {
    const created = await PayRequest.create({
      classId: klass._id,
      studentId: s0._id,
      amount: 75,
      reason: "Helping Others",
      justification: "Helped organize materials",
      status: "APPROVED",
    });

    const acct = await Account.findOne({
      studentId: s0._id,
      classId: klass._id,
    }).lean();
    if (acct) {
      await postTransaction({
        accountId: acct._id.toString(),
        classId: klass._id.toString(),
        classroomId: classroom._id.toString(),
        type: "PAYROLL", // one-time payment
        amount: 75,
        memo: "One-time payment: Helping Others",
        createdByUserId: teacher._id.toString(),
        idempotencyKey: ikey("seed", "payreq", created._id.toString()),
      });
      await PayRequest.findByIdAndUpdate(created._id, {
        $set: { status: "PAID" },
      });
    }
  }

  // submitted (pending)
  await PayRequest.updateOne(
    {
      classId: klass._id,
      studentId: s1._id,
      justification: "Great presentation",
    },
    {
      $setOnInsert: {
        amount: 120,
        reason: "Outstanding Project",
        justification: "Great presentation",
        status: "SUBMITTED",
      },
    },
    { upsert: true }
  );

  // 9) Optional: one purchase (no inventory checks here)
  const item = await StoreItem.findOne({ classId: klass._id }).lean();
  const acct0 = await Account.findOne({
    studentId: s0._id,
    classId: klass._id,
  }).lean();
  if (item && acct0) {
    await postTransaction({
      accountId: acct0._id.toString(),
      classId: klass._id.toString(),
      classroomId: classroom._id.toString(),
      type: "PURCHASE",
      amount: item.price,
      memo: `Purchased: ${item.title}`,
      createdByUserId: s0._id.toString(),
      idempotencyKey: ikey(
        "seed",
        "purchase",
        acct0._id.toString(),
        item._id.toString()
      ),
    });
  }

  console.log("✅ Seed complete:");
  console.log(`- Classroom: ${classroom.name} (${classroom._id})`);
  console.log(`- Class: ${klass.name} (${klass._id})`);
  console.log(`- Teachers: ${teacher.name}, ${teacher2.name}`);
  console.log(`- Students: ${students.map((s) => s.name).join(", ")}`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
