import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getClassStudentBalances, getClassTransactions } from "@/data/mock"
import { formatCurrency, formatDate } from "@/lib/format"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function TeacherClassOverview({ classId }: { classId: string }) {
  const balances = getClassStudentBalances(classId)
  const txns = getClassTransactions(classId)

  const totalBalance = balances.reduce((s, b) => s + b.balance, 0)
  const studentCount = balances.length

  const top5 = [...balances]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map((b) => ({ name: b.name, balance: b.balance }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Class Overview — Teacher</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Sum across students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Enrolled in this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions (30d)</CardTitle>
            <CardDescription>Recent activity count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{txns.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Balances</CardTitle>
          <CardDescription>Top 5 students</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="balance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest 12 across class</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txns.slice(-12).reverse().map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{formatDate(t.date)}</td>
                  <td className="py-2 pr-4">
                    {balances.find((b) => b.studentId === t.studentId)?.name ?? t.studentId}
                  </td>
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
                <tr><td colSpan={5} className="py-4 text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
