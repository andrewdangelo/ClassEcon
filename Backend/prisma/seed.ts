import { PrismaClient, PayPeriod } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // (Optional but recommended in dev) clear old data so seeding is idempotent
  await prisma.payRequest.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.job.deleteMany({})
  await prisma.storeItem.deleteMany({})
  await prisma.student.deleteMany({})
  await prisma.classReason.deleteMany({})
  await prisma.class.deleteMany({})

  // Create classes
  const algebra = await prisma.class.create({
    data: { slug: "algebra-i", name: "Algebra I", term: "Fall", room: "201", defaultCurrency: "CE$" },
  })
  const history = await prisma.class.create({
    data: { slug: "history-7", name: "History 7", term: "Fall", room: "105", defaultCurrency: "CE$" },
  })
  const science = await prisma.class.create({
    data: { slug: "science-6", name: "Science 6", term: "Fall", room: "Lab A", defaultCurrency: "CE$" },
  })

  // Reasons (no skipDuplicates)
  await prisma.classReason.createMany({
    data: [
      { classId: algebra.id, label: "Exceptional work" },
      { classId: algebra.id, label: "Classroom service" },
      { classId: algebra.id, label: "Tutoring peer" },
      { classId: history.id, label: "Historical project" },
      { classId: history.id, label: "Museum volunteering" },
      { classId: science.id, label: "Lab assistance" },
      { classId: science.id, label: "Cleanup crew" },
      { classId: science.id, label: "Science fair" },
    ],
  })

  // Students
  const s1 = await prisma.student.create({ data: { name: "Ava M.", classId: algebra.id, balance: 120 } })
  await prisma.student.create({ data: { name: "Liam K.", classId: algebra.id, balance: 80 } })
  await prisma.student.create({ data: { name: "Noah S.", classId: history.id, balance: 140 } })
  await prisma.student.create({ data: { name: "Emma R.", classId: history.id, balance: 60 } })
  await prisma.student.create({ data: { name: "Olivia C.", classId: science.id, balance: 200 } })

  // Jobs
  await prisma.job.createMany({
    data: [
      { classId: algebra.id, title: "Board Cleaner", payPeriod: PayPeriod.WEEKLY, salary: 20, slots: 1 },
      { classId: history.id, title: "Line Leader", payPeriod: PayPeriod.WEEKLY, salary: 15, slots: 2 },
    ],
  })

  // Store Items
  await prisma.storeItem.createMany({
    data: [
      { classId: algebra.id, name: "Homework Pass", price: 50, stock: 5 },
      { classId: algebra.id, name: "Sticker Pack", price: 10, stock: 20 },
      { classId: history.id, name: "Extra Recess (10m)", price: 30, stock: 8 },
      { classId: science.id, name: "Seat Swap", price: 25, stock: 3 },
      { classId: science.id, name: "Pencil Pack", price: 15, stock: 12 },
    ],
  })

  // Sample pay request
  await prisma.payRequest.create({
    data: {
      classId: algebra.id,
      studentId: s1.id,
      amount: 40,
      reason: "Exceptional work",
      justification: "Finished bonus problem set.",
    },
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

