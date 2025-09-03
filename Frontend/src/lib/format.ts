import { format } from "date-fns"

export function formatCurrency(n: number) {
  return `CE$ ${n.toLocaleString()}`
}

export function formatDate(iso: string) {
  return format(new Date(iso), "MMM d, yyyy")
}
