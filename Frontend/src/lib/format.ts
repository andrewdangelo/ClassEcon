import { format } from "date-fns"

const DEFAULT_CLASS_SYMBOL = "CE$"

/**
 * Classroom virtual currency (whole units, not Stripe minor units).
 * Uses a space between symbol and amount for scanability in tables and cards.
 */
export function formatClassMoney(
  amount: number,
  options?: { symbol?: string; locale?: string }
): string {
  const symbol = options?.symbol ?? DEFAULT_CLASS_SYMBOL
  const locale = options?.locale
  const n = Number(amount) || 0
  return `${symbol} ${n.toLocaleString(locale)}`
}

/** Alias for `formatClassMoney` (default classroom symbol). */
export function formatCurrency(n: number) {
  return formatClassMoney(n)
}

/**
 * Real-world money from Stripe-style amounts in the smallest currency unit (e.g. cents).
 */
export function formatStripeMoney(amountInMinorUnits: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amountInMinorUnits / 100)
}

export function formatDate(iso: string) {
  return format(new Date(iso), "MMM d, yyyy")
}
