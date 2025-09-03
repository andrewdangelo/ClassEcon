import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClassContext } from "@/context/ClassContext"
import { getStudentById, getTransactionsByStudentClass } from "@/data/mock"
import { formatCurrency, formatDate } from "@/lib/format"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import * as React from "react"

/** Build a running balance series from transactions */
function buildBalanceSeries(startBalance: number, txns: { date: string; amount: number }[]) {
  let running = startBalance
  // Start from earliest → compute balance after each txn
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date))
  const series = sorted.map((t) => {
    running += t.amount
    return { date: t.date, balance: running }
  })
  // If no txns, keep a flat point at start
  if (series.length === 0) return [{ date: new Date().toISOString().slice(0,10), balance: startBalance }]
  return series
}

export function StudentClassOverview({ classId }: { classId: string }) {
  const { currentStudentId } = useClassContext()
  const student = currentStudentId ? getStudentById(currentStudentId) : null
  if (!student || student.classId !== classId) {
    return <div>This demo assumes the current student belongs to this class.</div>
  }

  const txns = getTransactionsByStudentClass(student.id, classId)
  const chartData = buildBalanceSeries(0, txns.map((t) => ({ date: t.date, amount: t.amount })))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">My Class Overview — {student.name}</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Latest available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(student.balance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Count in this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{txns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Activity</CardTitle>
            <CardDescription>Most recent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {txns.length ? formatDate(txns[txns.length - 1].date) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Balance Over Time</CardTitle>
          <CardDescription>Cumulative after each transaction</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.35} />
                  <stop offset="95%" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="balance" strokeWidth={2} fillOpacity={1} fill="url(#bal)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest 10</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txns.slice(-10).reverse().map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{formatDate(t.date)}</td>
                  <td className="py-2 pr-4">{t.type}</td>
                  <td className="py-2 pr-4">{t.desc}</td>
                  <td className="py-2 text-right">
                    <span className={t.amount < 0 ? "text-destructive" : "text-emerald-600"}>
                      {t.amount < 0 ? "−" : "+"}{formatCurrency(Math.abs(t.amount))}
                    </span>
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
