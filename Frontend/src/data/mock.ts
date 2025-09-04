// --- existing exports (students, storeItems, jobs, transactions, helpers) remain ---
// Add the following new code near the top-level exports:

export type PayRequestStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "PAID"
  | "REBUKED"
  | "DENIED";
export type PayRequest = {
  id: string;
  classId: string;
  studentId: string;
  amount: number;
  reason: string;
  justification: string;
  status: PayRequestStatus;
  createdAt: string;
  updatedAt: string;
  teacherComment?: string;
};

// Per-class reason presets (normally part of class configuration)
export const classPayReasons: Record<string, string[]> = {
  "algebra-i": ["Exceptional work", "Classroom service", "Tutoring peer"],
  "history-7": ["Historical project", "Museum volunteering", "Extra credit"],
  "science-6": ["Lab assistance", "Cleanup crew", "Science fair"],
};

export const paymentRequests: PayRequest[] = [];

export function getPayReasonsForClass(classId: string): string[] {
  return classPayReasons[classId] ?? [];
}

export function getRequestsByClass(classId: string): PayRequest[] {
  return paymentRequests
    .filter((r) => r.classId === classId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRequestsByStudent(
  classId: string,
  studentId: string
): PayRequest[] {
  return paymentRequests
    .filter((r) => r.classId === classId && r.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPayRequest(input: {
  classId: string;
  studentId: string;
  amount: number;
  reason: string;
  justification: string;
}): PayRequest {
  const id = `pr_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const req: PayRequest = {
    id,
    classId: input.classId,
    studentId: input.studentId,
    amount: input.amount,
    reason: input.reason,
    justification: input.justification,
    status: "SUBMITTED",
    createdAt: now,
    updatedAt: now,
  };
  paymentRequests.push(req);
  return req;
}

export function setRequestStatus(
  id: string,
  status: PayRequestStatus,
  teacherComment?: string
): PayRequest | null {
  const req = paymentRequests.find((r) => r.id === id);
  if (!req) return null;
  req.status = status;
  req.updatedAt = new Date().toISOString();
  if (teacherComment !== undefined) req.teacherComment = teacherComment;
  return req;
}

export function resubmitRequest(
  id: string,
  updates: { amount: number; reason: string; justification: string }
): PayRequest | null {
  const req = paymentRequests.find((r) => r.id === id);
  if (!req) return null;
  req.amount = updates.amount;
  req.reason = updates.reason;
  req.justification = updates.justification;
  req.status = "SUBMITTED";
  req.updatedAt = new Date().toISOString();
  // clear teacher comment upon resubmission
  delete req.teacherComment;
  return req;
}

// Pay a request: mark as PAID + create a transaction and bump student's balance
export function payRequest(id: string): PayRequest | null {
  const req = paymentRequests.find((r) => r.id === id);
  if (!req) return null;
  req.status = "PAID";
  req.updatedAt = new Date().toISOString();

  // Add transaction
  const tid = `t_${Math.random().toString(36).slice(2, 10)}`;
  const tx = {
    id: tid,
    classId: req.classId,
    studentId: req.studentId,
    type: "PAY" as const,
    amount: req.amount,
    date: new Date().toISOString().slice(0, 10),
    desc: `One-time payment: ${req.reason}`,
  };
  transactions.push(tx);

  // Update student's balance
  const stu = students.find((s) => s.id === req.studentId);
  if (stu) stu.balance += req.amount;

  return req;
}
