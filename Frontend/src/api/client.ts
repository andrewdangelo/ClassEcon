// Fake async API wrapping the mock data with latency and occasional errors.
import {
  getStudentsByClass,
  getStoreItemsByClass,
  getTotalBalanceForClass,
  type Student,
  type StoreItem,
} from "@/data/mock"

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

async function simulate<T>(fn: () => T, { min = 300, max = 900, failRate = 0.12 } = {}): Promise<T> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  await delay(ms)
  if (Math.random() < failRate) {
    throw new Error("Network hiccup — please try again.")
  }
  return fn()
}

export async function apiFetchStudentsByClass(classId: string): Promise<Student[]> {
  return simulate(() => getStudentsByClass(classId).map((s) => ({ ...s })))
}

export async function apiFetchStoreItemsByClass(classId: string): Promise<StoreItem[]> {
  return simulate(() => getStoreItemsByClass(classId).map((i) => ({ ...i })))
}

export async function apiFetchTotalBalanceForClass(classId: string): Promise<number> {
  return simulate(() => getTotalBalanceForClass(classId))
}
