import fs from "node:fs"
import path from "node:path"
import { PrismaClient, PayPeriod, TransactionType, PayRequestStatus } from "@prisma/client"

type Mock = {
  classes: Array<{
    slug: string
    name: string
    term?: string
    room?: string
    defaultCurrency?: string
    reasons?: string[]
    students?: Array<{ name: string; balance?: number }>
    jobs?: Array<{ title: string; payPeriod: keyof typeof PayPeriod; salary: number; slots: number }>
    storeItems?: Array<{ name: string; price: number; stock: number }>
    transactions?: Array<{ studentName: string; type: keyof typeof TransactionType; amount: number; desc: string; date?: string }>
    payRequests?: Array<{ studentName: string; amount: number; reason: string; justification: string; status?: keyof typeof PayRequestStatus }>
  }>
}

const prisma = new PrismaClient()

async function upsertClassBySlug(slug: string, data: any) {
  const existing = await prisma.class.findUnique({ where: { slug } })
  if (existing) {
    return prisma.class.update({ where: { slug }, data })
  }
  return prisma.class.create({ data: { slug, ...data } })
}

async function main() {
  const file = path.join(process.cwd(), "prisma", "mock-data.json")
  const raw = fs.readFileSync(file, "utf-8")
  const mock: Mock = JSON.parse(raw)

  for (const cls of mock.classes) {
    // 1) Class
    const klass = await upsertClassBySlug(cls.slug, {
      name: cls.name,
      term: cls.term ?? null,
      room: cls.room ?? null,
      defaultCurrency: cls.defaultCurrency ?? "CE$",
    })

    // 2) Reasons (clear + recreate for simplicity)
    await prisma.classReason.deleteMany({ where: { classId: klass.id } })
    if (cls.reasons?.length) {
      await prisma.classReason.createMany({
        data: cls.reasons.map((label) => ({ classId: klass.id, label })),
      })
    }

    // 3) Students (upsert by (classId, name))
    const existingStudents = await prisma.student.findMany({ where: { classId: klass.id } })
    const byName = new Map(existingStudents.map((s) => [s.name, s]))
    for (const s of cls.students ?? []) {
      const found = byName.get(s.name)
      if (found) {
        await prisma.student.update({
          where: { id: found.id },
          data: { balance: s.balance ?? found.balance },
        })
      } else {
        await prisma.student.create({
          data: { classId: klass.id, name: s.name, balance: s.balance ?? 0 },
        })
      }
    }

    // 4) Jobs (replace for simplicity)
    await prisma.job.deleteMany({ where: { classId: klass.id } })
    if (cls.jobs?.length) {
      await prisma.job.createMany({
        data: cls.jobs.map((j) => ({
          classId: klass.id,
          title: j.title,
          payPeriod: j.payPeriod as PayPeriod,
          salary: j.salary,
          slots: j.slots,
        })),
      })
    }

    // 5) Store items (replace)
    await prisma.storeItem.deleteMany({ where: { classId: klass.id } })
    if (cls.storeItems?.length) {
      await prisma.storeItem.createMany({
        data: cls.storeItems.map((i) => ({
          classId: klass.id,
          name: i.name,
          price: i.price,
          stock: i.stock,
        })),
      })
    }

    // Find students again to get IDs for links
    const students = await prisma.student.findMany({ where: { classId: klass.id } })
    const studentByName = new Map(students.map((s) => [s.name, s]))

    // 6) Transactions (replace)
    await prisma.transaction.deleteMany({ where: { classId: klass.id } })
    if (cls.transactions?.length) {
      for (const t of cls.transactions) {
        const student = studentByName.get(t.studentName)
        if (!student) continue
        await prisma.transaction.create({
          data: {
            classId: klass.id,
            studentId: student.id,
            type: t.type as TransactionType,
            amount: t.amount,
            desc: t.desc,
            date: t.date ? new Date(t.date) : new Date(),
          },
        })
      }
    }

    // 7) Pay requests (replace)
    await prisma.payRequest.deleteMany({ where: { classId: klass.id } })
    if (cls.payRequests?.length) {
      for (const r of cls.payRequests) {
        const student = studentByName.get(r.studentName)
        if (!student) continue
        await prisma.payRequest.create({
          data: {
            classId: klass.id,
            studentId: student.id,
            amount: r.amount,
            reason: r.reason,
            justification: r.justification,
            status: (r.status ?? "SUBMITTED") as PayRequestStatus,
          },
        })
      }
    }
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
