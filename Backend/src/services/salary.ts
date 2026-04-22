import cron from "node-cron";
import { Employment, Transaction } from "../models";
import { addToBalance } from "./balance";
import { Types } from "mongoose";

let salaryProcessingInProgress = false;

async function runSalaryPaymentsSafely(trigger: string) {
  if (salaryProcessingInProgress) {
    console.log(`[Salary Cron] Skipping ${trigger}: previous run still in progress`);
    return;
  }

  salaryProcessingInProgress = true;
  try {
    await processSalaryPayments();
  } finally {
    salaryProcessingInProgress = false;
  }
}

/**
 * Process salary payments for all active employments
 */
export async function processSalaryPayments() {
  console.log(`[Salary Cron] Starting salary payment processing at ${new Date().toISOString()}`);
  
  try {
    // Get all active employments
    const activeEmployments = await Employment.find({ status: "ACTIVE" })
      .populate("jobId")
      .populate("studentId")
      .lean()
      .exec();

    console.log(`[Salary Cron] Found ${activeEmployments.length} active employments`);

    const now = new Date();
    let paymentsProcessed = 0;
    let errors = 0;

    for (const employment of activeEmployments) {
      try {
        const job = employment.jobId as any;
        const student = employment.studentId as any;

        if (!job || !student) {
          console.warn(`[Salary Cron] Skipping employment ${employment._id}: missing job or student`);
          continue;
        }

        // Check if payment is due based on period
        if (!isPaymentDue(employment, job.period, now)) {
          continue;
        }

        // Process payment
        await processEmploymentPayment(employment, job, student);
        paymentsProcessed++;

      } catch (error) {
        console.error(`[Salary Cron] Error processing employment ${employment._id}:`, error);
        errors++;
      }
    }

    console.log(`[Salary Cron] Completed: ${paymentsProcessed} payments processed, ${errors} errors`);
  } catch (error) {
    console.error("[Salary Cron] Fatal error in salary payment processing:", error);
  }
}

/**
 * Check if payment is due for an employment
 */
function isPaymentDue(employment: any, period: string, now: Date): boolean {
  const lastPaidAt = employment.lastPaidAt ? new Date(employment.lastPaidAt) : new Date(employment.startedAt);
  const daysSinceLastPayment = Math.floor((now.getTime() - lastPaidAt.getTime()) / (1000 * 60 * 60 * 24));

  switch (period) {
    case "WEEKLY":
      return daysSinceLastPayment >= 7;
    case "BIWEEKLY":
      return daysSinceLastPayment >= 14;
    case "MONTHLY":
      // Check if it's a new month and hasn't been paid this month
      return now.getMonth() !== lastPaidAt.getMonth() || now.getFullYear() !== lastPaidAt.getFullYear();
    case "SEMESTER":
      // Check if it's been at least 5 months (roughly a semester)
      return daysSinceLastPayment >= 150;
    default:
      return false;
  }
}

/**
 * Process a single employment payment
 */
async function processEmploymentPayment(employment: any, job: any, student: any) {
  const amount = job.salary.amount;
  const studentId = toObjectId(
    student?._id ?? employment.studentId,
    "studentId"
  );
  const classId = toObjectId(employment.classId, "classId");

  console.log(
    `[Salary Cron] Processing payment: $${amount} to ${student.name} for ${job.title}`
  );

  // Get or create account
  const account = await addToBalance({
    userId: studentId,
    classId: classId,
    amount: amount,
  });

  // Get class info for classroomId
  const { ClassModel } = await import("../models");
  const classDoc = await ClassModel.findById(classId).lean().exec();
  if (!classDoc) {
    throw new Error("Class not found");
  }

  // Create transaction record
  await Transaction.create({
    accountId: account._id,
    classId: classId,
    classroomId: classDoc.classroomId,
    type: "PAYROLL",
    amount: amount,
    memo: `Salary payment for ${job.title}`,
    createdByUserId: studentId, // System transaction, but we need a user ID
  });

  // Update lastPaidAt
  await Employment.findByIdAndUpdate(employment._id, {
    lastPaidAt: new Date(),
  });

  console.log(`[Salary Cron] Payment successful for employment ${employment._id}`);
}

/**
 * Initialize and start all salary cron jobs
 */
export function initSalaryCronJobs() {
  console.log("[Salary Cron] Initializing salary payment cron jobs...");

  // Run daily check at 9 AM - this will check all periods
  const dailyJob = cron.schedule("0 9 * * *", async () => {
    console.log("[Salary Cron] Daily salary check triggered");
    await runSalaryPaymentsSafely("daily salary check");
  });

  // Also run a check every hour for more frequent payments (optional)
  const hourlyJob = cron.schedule("0 * * * *", async () => {
    console.log("[Salary Cron] Hourly salary check triggered");
    await runSalaryPaymentsSafely("hourly salary check");
  });

  console.log("[Salary Cron] Cron jobs initialized successfully");
  console.log("  - Daily check: 9 AM every day");
  console.log("  - Hourly check: Every hour");

  // Run immediately on startup for testing
  console.log("[Salary Cron] Running initial payment check...");
  runSalaryPaymentsSafely("startup payment check").catch(error => {
    console.error("[Salary Cron] Error in initial payment check:", error);
  });

  return { dailyJob, hourlyJob };
}

/**
 * Manually trigger a salary payment for a specific employment
 * Useful for testing or admin actions
 */
export async function manualPayEmployment(employmentId: string) {
  const employment = await Employment.findById(employmentId)
    .populate("jobId")
    .populate("studentId")
    .exec();

  if (!employment) {
    throw new Error("Employment not found");
  }

  const job = employment.jobId as any;
  const student = employment.studentId as any;

  if (!job || !student) {
    throw new Error("Invalid employment: missing job or student");
  }

  await processEmploymentPayment(employment, job, student);
  
  return {
    success: true,
    amount: job.salary.amount,
    studentName: student.name,
    jobTitle: job.title,
  };
}

function toObjectId(value: unknown, fieldName: string): Types.ObjectId {
  if (value instanceof Types.ObjectId) {
    return value;
  }

  const rawValue =
    value && typeof value === "object" ? (value as any)._id ?? value : value;
  const normalized = String(rawValue ?? "");

  if (Types.ObjectId.isValid(normalized)) {
    return new Types.ObjectId(normalized);
  }

  throw new Error(`[Salary Cron] Invalid ${fieldName}: ${normalized}`);
}
