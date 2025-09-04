import type { PrismaClient, PayRequestStatus, TransactionType } from "@prisma/client"
import { GraphQLError } from "graphql"
import { DateTimeResolver } from "graphql-scalars"

type Ctx = { prisma: PrismaClient }

export const resolvers = {
  // wire up custom scalar
  DateTime: DateTimeResolver,

  Query: {
    classes: (_: any, __: any, { prisma }: Ctx) => prisma.class.findMany(),
    class: (_: any, args: { id?: string; slug?: string }, { prisma }: Ctx) =>
      prisma.class.findFirst({ where: { OR: [{ id: args.id ?? "" }, { slug: args.slug ?? "" }] } }),
    studentsByClass: (_: any, { classId }: { classId: string }, { prisma }: Ctx) =>
      prisma.student.findMany({ where: { classId } }),
    storeItemsByClass: (_: any, { classId }: { classId: string }, { prisma }: Ctx) =>
      prisma.storeItem.findMany({ where: { classId } }),
    payRequestsByClass: (_: any, { classId, status }: { classId: string; status?: PayRequestStatus }, { prisma }: Ctx) =>
      prisma.payRequest.findMany({ where: { classId, ...(status ? { status } : {}) }, orderBy: { createdAt: "desc" } }),
    payRequestsByStudent: (_: any, { classId, studentId }: { classId: string; studentId: string }, { prisma }: Ctx) =>
      prisma.payRequest.findMany({ where: { classId, studentId }, orderBy: { createdAt: "desc" } }),
    reasonsByClass: (_: any, { classId }: { classId: string }, { prisma }: Ctx) =>
      prisma.classReason.findMany({ where: { classId }, orderBy: { label: "asc" } }),
  },

  Mutation: {
    async createClass(_: any, { input }: any, { prisma }: Ctx) {
      const exists = await prisma.class.findUnique({ where: { slug: input.slug } })
      if (exists) throw new GraphQLError("Slug already exists")

      const cls = await prisma.class.create({
        data: {
          slug: input.slug,
          name: input.name,
          term: input.term ?? null,
          room: input.room ?? null,
          defaultCurrency: input.defaultCurrency ?? "CE$",
        }
      })

      if (Array.isArray(input.reasons) && input.reasons.length) {
        await prisma.classReason.createMany({
          data: input.reasons.map((label: string) => ({ classId: cls.id, label })),
          skipDuplicates: true,
        })
      }
      if (Array.isArray(input.students) && input.students.length) {
        await prisma.student.createMany({
          data: input.students.map((s: any) => ({ name: s.name, classId: cls.id }))
        })
      }
      if (Array.isArray(input.jobs) && input.jobs.length) {
        await prisma.job.createMany({
          data: input.jobs.map((j: any) => ({ ...j, classId: cls.id }))
        })
      }
      if (Array.isArray(input.storeItems) && input.storeItems.length) {
        await prisma.storeItem.createMany({
          data: input.storeItems.map((i: any) => ({ ...i, classId: cls.id }))
        })
      }
      return cls
    },

    async addReasons(_: any, { classId, labels }: { classId: string; labels: string[] }, { prisma }: Ctx) {
      await prisma.classReason.createMany({
        data: labels.map((label) => ({ classId, label })),
        skipDuplicates: true,
      })
      return prisma.classReason.findMany({ where: { classId }, orderBy: { label: "asc" } })
    },

    async setReasons(_: any, { classId, labels }: { classId: string; labels: string[] }, { prisma }: Ctx) {
      await prisma.classReason.deleteMany({ where: { classId } })
      await prisma.classReason.createMany({ data: labels.map((label) => ({ classId, label })) })
      return prisma.classReason.findMany({ where: { classId }, orderBy: { label: "asc" } })
    },

    async createPayRequest(_: any, { input }: any, { prisma }: Ctx) {
      const reason = await prisma.classReason.findFirst({ where: { classId: input.classId, label: input.reason } })
      if (!reason) throw new GraphQLError("Reason not allowed for this class")
      const student = await prisma.student.findFirst({ where: { id: input.studentId, classId: input.classId } })
      if (!student) throw new GraphQLError("Student not found in this class")

      return prisma.payRequest.create({
        data: {
          classId: input.classId,
          studentId: input.studentId,
          amount: input.amount,
          reason: input.reason,
          justification: input.justification,
          status: "SUBMITTED",
        }
      })
    },

    approvePayRequest: (_: any, { id, comment }: any, { prisma }: Ctx) =>
      prisma.payRequest.update({
        where: { id },
        data: { status: "APPROVED", teacherComment: comment ?? null }
      }),

    async submitPayRequest(_: any, { id }: { id: string }, { prisma }: Ctx) {
      const req = await prisma.payRequest.findUnique({ where: { id } })
      if (!req) throw new GraphQLError("Request not found")
      if (req.status === "DENIED") throw new GraphQLError("Denied request cannot be paid")
      if (req.status === "PAID") return req

      const updated = await prisma.payRequest.update({
        where: { id },
        data: { status: "PAID" }
      })

      await prisma.transaction.create({
        data: {
          classId: req.classId,
          studentId: req.studentId,
          type: "PAY" as TransactionType,
          amount: req.amount,
          desc: `One-time payment: ${req.reason}`,
        }
      })
      await prisma.student.update({
        where: { id: req.studentId },
        data: { balance: { increment: req.amount } }
      })

      return updated
    },

    async rebukePayRequest(_: any, { id, comment }: any, { prisma }: Ctx) {
      if (!comment?.trim()) throw new GraphQLError("Comment required for rebuke")
      return prisma.payRequest.update({
        where: { id },
        data: { status: "REBUKED", teacherComment: comment }
      })
    },

    denyPayRequest: (_: any, { id, comment }: any, { prisma }: Ctx) =>
      prisma.payRequest.update({
        where: { id },
        data: { status: "DENIED", teacherComment: comment ?? null }
      }),
  },

  Class: {
    students: (p: any, _: any, { prisma }: Ctx) => prisma.student.findMany({ where: { classId: p.id } }),
    storeItems: (p: any, _: any, { prisma }: Ctx) => prisma.storeItem.findMany({ where: { classId: p.id } }),
    jobs: (p: any, _: any, { prisma }: Ctx) => prisma.job.findMany({ where: { classId: p.id } }),
    transactions: (p: any, _: any, { prisma }: Ctx) =>
      prisma.transaction.findMany({ where: { classId: p.id }, orderBy: { date: "desc" } }),
    payRequests: (p: any, _: any, { prisma }: Ctx) =>
      prisma.payRequest.findMany({ where: { classId: p.id }, orderBy: { createdAt: "desc" } }),
    reasons: (p: any, _: any, { prisma }: Ctx) =>
      prisma.classReason.findMany({ where: { classId: p.id }, orderBy: { label: "asc" } }),
  },

  PayRequest: {
    class: (p: any, _: any, { prisma }: Ctx) => prisma.class.findUnique({ where: { id: p.classId } }),
    student: (p: any, _: any, { prisma }: Ctx) => prisma.student.findUnique({ where: { id: p.studentId } }),
  },

  Student: {
    class: (p: any, _: any, { prisma }: Ctx) => prisma.class.findUnique({ where: { id: p.classId } }),
    txns: (p: any, _: any, { prisma }: Ctx) =>
      prisma.transaction.findMany({ where: { studentId: p.id }, orderBy: { date: "desc" } }),
    requests: (p: any, _: any, { prisma }: Ctx) =>
      prisma.payRequest.findMany({ where: { studentId: p.id }, orderBy: { createdAt: "desc" } }),
  }
}
