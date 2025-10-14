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
  // Check if membership exists for this user+role
  const existing = await Membership.findOne({ userId: toId(userId), role });
  
  if (existing) {
    // Add classId to classIds array if not already present
    if (!existing.classIds.some(id => id.toString() === classId)) {
      await Membership.updateOne(
        { userId: toId(userId), role },
        { $addToSet: { classIds: toId(classId) } }
      );
    }
  } else {
    // Create new membership with classId in classIds array
    await Membership.create({
      userId: toId(userId),
      role,
      classIds: [toId(classId)],
      status: "ACTIVE"
    });
  }
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

  // Create more students for multiple classes
  const allStudentNames = [
    "Ava", "Liam", "Noah", "Olivia", "Mason", "Sophia",
    "Emma", "Lucas", "Isabella", "Ethan", "Mia", "Alexander",
    "Charlotte", "James", "Amelia", "Benjamin", "Harper", "William"
  ];
  
  const students = await Promise.all(
    allStudentNames.map((name) =>
      getOrCreateUser({ role: "STUDENT", name })
    )
  );

  // 2) Classroom
  const classroom = await ensureClassroom({
    name: "Room 204 – Fall 2025",
    ownerId: teacher._id.toString(),
    currency: "CE$",
  });

  // 3) Create multiple classes
  const klass1 = await ensureClass({
    classroomId: classroom._id.toString(),
    name: "Economics Fundamentals",
    slug: "econ-fundamentals",
    period: "Period 1",
    subject: "Economics",
    teacherIds: [teacher._id.toString()],
  });

  const klass2 = await ensureClass({
    classroomId: classroom._id.toString(),
    name: "Math Adventures",
    slug: "math-adventures",
    period: "Period 3",
    subject: "Mathematics",
    teacherIds: [teacher._id.toString()],
  });

  const klass3 = await ensureClass({
    classroomId: classroom._id.toString(),
    name: "Science Explorers",
    slug: "science-explorers",
    period: "Period 5",
    subject: "Science",
    teacherIds: [teacher._id.toString(), teacher2._id.toString()],
  });

  // Store all classes for iteration
  const allClasses = [klass1, klass2, klass3];
  
  // Divide students across classes
  const studentsPerClass = [
    students.slice(0, 6),   // First 6 students in Economics
    students.slice(6, 12),  // Next 6 students in Math
    students.slice(12, 18), // Last 6 students in Science
  ];

  // 4) Setup each class with students, memberships, and data
  for (let i = 0; i < allClasses.length; i++) {
    const klass = allClasses[i];
    const classStudents = studentsPerClass[i];

    console.log(`\n📚 Setting up class: ${klass.name}...`);

    // Add students to class
    for (const s of classStudents) {
      await ensureMembership(s._id.toString(), klass._id.toString(), "STUDENT");
      await ensureAccount(
        s._id.toString(),
        klass._id.toString(),
        classroom._id.toString()
      );
    }

    // Add teachers as class members
    await ensureMembership(
      teacher._id.toString(),
      klass._id.toString(),
      "TEACHER"
    );
    if (i === 2) { // Only Science class has both teachers
      await ensureMembership(
        teacher2._id.toString(),
        klass._id.toString(),
        "TEACHER"
      );
    }

    // 5) Reasons for each class
    await ensureClassReasons(klass._id.toString(), [
      "Great Participation",
      "Outstanding Project",
      "Helping Others",
      "Excellent Homework",
      "Missed Homework",
      "Late to Class",
      "Disrupting Class",
    ]);

    // 6) Store Items & Jobs for each class
    await seedStoreItems(klass._id.toString());
    await seedJobs(klass._id.toString());

    // 7) Seed some balances via transactions
    for (const s of classStudents) {
      const acct = await Account.findOne({
        studentId: s._id,
        classId: klass._id,
      }).lean();
      if (!acct) continue;

      // Initial DEPOSIT
      await postTransaction({
        accountId: acct._id.toString(),
        classId: klass._id.toString(),
        classroomId: classroom._id.toString(),
        type: "DEPOSIT",
        amount: 500,
        memo: "Starting balance",
        createdByUserId: teacher._id.toString(),
        idempotencyKey: ikey("seed", "deposit", acct._id.toString(), klass._id.toString()),
      });

      // PAYROLL (weekly allowance) - 2 weeks
      for (let week = 1; week <= 2; week++) {
        await postTransaction({
          accountId: acct._id.toString(),
          classId: klass._id.toString(),
          classroomId: classroom._id.toString(),
          type: "PAYROLL",
          amount: 150,
          memo: `Week ${week} allowance`,
          createdByUserId: teacher._id.toString(),
          idempotencyKey: ikey("seed", "payroll", acct._id.toString(), klass._id.toString(), week),
        });
      }

      // Random fines for some students
      if (Math.random() > 0.5) {
        await postTransaction({
          accountId: acct._id.toString(),
          classId: klass._id.toString(),
          classroomId: classroom._id.toString(),
          type: "FINE",
          amount: 25,
          memo: "Late to class",
          createdByUserId: teacher._id.toString(),
          idempotencyKey: ikey("seed", "fine", acct._id.toString(), klass._id.toString(), 1),
        });
      }

      // Random bonus for some students
      if (Math.random() > 0.6) {
        await postTransaction({
          accountId: acct._id.toString(),
          classId: klass._id.toString(),
          classroomId: classroom._id.toString(),
          type: "DEPOSIT",
          amount: 100,
          memo: "Excellent homework bonus",
          createdByUserId: teacher._id.toString(),
          idempotencyKey: ikey("seed", "bonus", acct._id.toString(), klass._id.toString(), 1),
        });
      }
    }

    // 8) Pay Requests for each class
    const s0 = classStudents[0];
    const s1 = classStudents[1];

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
          type: "PAYROLL",
          amount: 75,
          memo: "One-time payment: Helping Others",
          createdByUserId: teacher._id.toString(),
          idempotencyKey: ikey("seed", "payreq", created._id.toString(), klass._id.toString()),
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

    // 9) Some purchases
    const items = await StoreItem.find({ classId: klass._id }).limit(2).lean();
    for (let j = 0; j < Math.min(2, classStudents.length); j++) {
      const s = classStudents[j];
      const item = items[j % items.length];
      const acct = await Account.findOne({
        studentId: s._id,
        classId: klass._id,
      }).lean();
      if (item && acct) {
        await postTransaction({
          accountId: acct._id.toString(),
          classId: klass._id.toString(),
          classroomId: classroom._id.toString(),
          type: "PURCHASE",
          amount: item.price,
          memo: `Purchased: ${item.title}`,
          createdByUserId: s._id.toString(),
          idempotencyKey: ikey(
            "seed",
            "purchase",
            acct._id.toString(),
            item._id.toString(),
            klass._id.toString()
          ),
        });
      }
    }

    console.log(`✅ ${klass.name}: ${classStudents.length} students enrolled`);
  }

  console.log("\n🎉 Seed complete!");
  console.log(`\n📊 Summary:`);
  console.log(`- Classroom: ${classroom.name} (${classroom._id})`);
  console.log(`- Classes: ${allClasses.length}`);
  allClasses.forEach((k, i) => {
    console.log(`  ${i + 1}. ${k.name} (${k.slug}) - ${studentsPerClass[i].length} students`);
  });
  console.log(`- Teachers: ${teacher.name}, ${teacher2.name}`);
  console.log(`- Total Students: ${students.length}`);
  console.log(`\n🔑 Login Credentials:`);
  console.log(`Teacher: ${teacher.email}`);
  console.log(`Students: ${students.slice(0, 3).map(s => s.name).join(", ")}, ...`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
