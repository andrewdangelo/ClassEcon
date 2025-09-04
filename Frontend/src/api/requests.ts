import {
  createPayRequest,
  getPayReasonsForClass,
  getRequestsByClass,
  getRequestsByStudent,
  payRequest as payReq,
  resubmitRequest,
  setRequestStatus,
  type PayRequest,
} from "@/data/mock"

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)) }
async function simulate<T>(f: () => T, failRate = 0.08): Promise<T> {
  await delay(300 + Math.random() * 400)
  if (Math.random() < failRate) throw new Error("Network hiccup — try again.")
  return f()
}

export async function apiGetReasons(classId: string): Promise<string[]> {
  return simulate(() => getPayReasonsForClass(classId), 0)
}

export async function apiCreatePayRequest(input: {
  classId: string
  studentId: string
  amount: number
  reason: string
  justification: string
}): Promise<PayRequest> {
  return simulate(() => createPayRequest(input))
}

export async function apiGetRequestsByStudent(classId: string, studentId: string): Promise<PayRequest[]> {
  return simulate(() => getRequestsByStudent(classId, studentId), 0)
}

export async function apiGetRequestsByClass(classId: string): Promise<PayRequest[]> {
  return simulate(() => getRequestsByClass(classId), 0)
}

export async function apiApproveRequest(id: string, teacherComment?: string): Promise<PayRequest | null> {
  return simulate(() => setRequestStatus(id, "APPROVED", teacherComment))
}

export async function apiDenyRequest(id: string, teacherComment?: string): Promise<PayRequest | null> {
  return simulate(() => setRequestStatus(id, "DENIED", teacherComment))
}

export async function apiRebukeRequest(id: string, teacherComment: string): Promise<PayRequest | null> {
  return simulate(() => setRequestStatus(id, "REBUKED", teacherComment))
}

export async function apiResubmitRequest(id: string, updates: { amount: number; reason: string; justification: string }): Promise<PayRequest | null> {
  return simulate(() => resubmitRequest(id, updates))
}

export async function apiSubmitPayment(id: string): Promise<PayRequest | null> {
  return simulate(() => payReq(id))
}
