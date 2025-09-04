import { PayRequestStatus } from "@/data/mock"
import { cn } from "@/lib/utils"

const map: Record<PayRequestStatus, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REBUKED: "bg-amber-100 text-amber-700 border-amber-200",
  DENIED: "bg-rose-100 text-rose-700 border-rose-200",
}

export function StatusPill({ status }: { status: PayRequestStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", map[status])}>
      {status.toLowerCase()}
    </span>
  )
}
