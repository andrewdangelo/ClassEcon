import { ClassSummary } from "@/context/ClassContext"

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export type ClassCreateInput = {
  name: string
  term?: string
  room?: string
  defaultCurrency?: string
  policies?: {
    allowNegative?: boolean
    requireFineReason?: boolean
    perItemPurchaseLimit?: number | null
  }
}

export async function apiCreateClass(input: ClassCreateInput): Promise<ClassSummary> {
  // simulate latency & success
  await delay(500)
  // In a real API, backend would generate id; here we return summary only
  return {
    id: "", // will be replaced by context.addClass to ensure uniqueness
    name: input.name,
    term: input.term,
    room: input.room,
    defaultCurrency: input.defaultCurrency || "CE$",
  }
}
