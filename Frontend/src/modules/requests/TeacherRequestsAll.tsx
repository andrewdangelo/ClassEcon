import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { useClassContext } from "@/context/ClassContext"
import { getStudentsByClass } from "@/data/mock"
import {
  apiApproveRequest,
  apiDenyRequest,
  apiGetRequestsByClass,
  apiRebukeRequest,
  apiSubmitPayment,
} from "@/api/requests"
import { StatusPill } from "@/components/StatusPill/StatusPill"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type Status = "ALL" | "SUBMITTED" | "APPROVED" | "REBUKED" | "DENIED" | "PAID"

export default function TeacherRequestsAll() {
  const { role, classes } = useClassContext()
  const { push } = useToast()

  const [loading, setLoading] = React.useState(true)
  const [requests, setRequests] = React.useState<any[]>([])
  const [notes, setNotes] = React.useState<Record<string, string>>({})
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState<Status>("ALL")
  const [classFilter, setClassFilter] = React.useState<string>("ALL")
  const [studentNames, setStudentNames] = React.useState<Record<string, string>>({})
  const idToClassName = React.useMemo(() => Object.fromEntries(classes.map(c => [c.id, c.name])), [classes])

  React.useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // Load all requests across teacher's classes
        const reqsArrays = await Promise.all(classes.map(c => apiGetRequestsByClass(c.id)))
        const merged = reqsArrays.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        if (!mounted) return
        setRequests(merged)

        // Build student name map for all classes
        const studs = classes.flatMap(c => getStudentsByClass(c.id))
        setStudentNames(Object.fromEntries(studs.map(s => [s.id, s.name])))
      } catch (e: any) {
        push({ title: "Failed to load requests", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [classes, push])

  if (role !== "TEACHER") {
    return <div className="text-sm text-muted-foreground">Teachers only.</div>
  }

  // Filters
  const filtered = requests.filter(r => {
    if (classFilter !== "ALL" && r.classId !== classFilter) return false
    if (status !== "ALL" && r.status !== status) return false
    const needle = q.toLowerCase().trim()
    if (!needle) return true
    return (
      (studentNames[r.studentId] || "").toLowerCase().includes(needle) ||
      (idToClassName[r.classId] || "").toLowerCase().includes(needle) ||
      r.reason.toLowerCase().includes(needle)
    )
  })

  // Summary data
  const counts = requests.reduce<Record<Exclude<Status, "ALL">, number>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    { SUBMITTED: 0, APPROVED: 0, REBUKED: 0, DENIED: 0, PAID: 0 }
  )
  const chartData = Object.entries(counts).map(([k, v]) => ({ status: k.toLowerCase(), count: v }))

  const update = (updated: any) => setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)))

  const approve = async (id: string) => {
    try {
      const updated = await apiApproveRequest(id, notes[id])
      if (updated) { update(updated); push({ title: "Approved" }) }
    } catch (e: any) { push({ title: "Action failed", description: e.message, variant: "destructive" }) }
  }
  const pay = async (id: string) => {
    try {
      const updated = await apiSubmitPayment(id)
      if (updated) { update(updated); push({ title: "Payment submitted", description: "Student balance updated" }) }
    } catch (e: any) { push({ title: "Payment failed", description: e.message, variant: "destructive" }) }
  }
  const rebuke = async (id: string) => {
    const msg = notes[id]?.trim()
    if (!msg) return push({ title: "Comment required", description: "Provide guidance for resubmission.", variant: "destructive" })
    try {
      const updated = await apiRebukeRequest(id, msg)
      if (updated) { update(updated); push({ title: "Rebuked", description: "Sent back for resubmission" }) }
    } catch (e: any) { push({ title: "Action failed", description: e.message, variant: "destructive" }) }
  }
  const deny = async (id: string) => {
    try {
      const updated = await apiDenyRequest(id, notes[id])
      if (updated) { update(updated); push({ title: "Denied" }) }
    } catch (e: any) { push({ title: "Action failed", description: e.message, variant: "destructive" }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Requests</h2>
        <div className="flex gap-2">
          <Input placeholder="Search student, class, reason…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            aria-label="Filter by class"
          >
            <option value="ALL">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REBUKED">Rebuked</option>
            <option value="DENIED">Denied</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card><CardHeader><CardTitle>Submitted</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{counts.SUBMITTED}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Approved</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{counts.APPROVED}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Rebuked</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{counts.REBUKED}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Denied</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{counts.DENIED}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Paid</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{counts.PAID}</div></CardContent></Card>
      </div>

      {/* Mini chart */}
      <Card>
        <CardHeader><CardTitle>Requests by Status</CardTitle></CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No matching requests.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Class</th>
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">Reason</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Comment</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b align-top last:border-0">
                    <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{idToClassName[r.classId] ?? r.classId}</td>
                    <td className="py-2 pr-4">{studentNames[r.studentId] ?? r.studentId}</td>
                    <td className="py-2 pr-4">
                      <div className="font-medium">{r.reason}</div>
                      <div className="text-muted-foreground">{r.justification}</div>
                    </td>
                    <td className="py-2 pr-4">CE$ {r.amount}</td>
                    <td className="py-2 pr-4"><StatusPill status={r.status} /></td>
                    <td className="py-2 pr-4">
                      <Textarea
                        placeholder="Optional note (required for rebuke)"
                        value={notes[r.id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      />
                      {r.teacherComment && (
                        <div className="mt-1 text-xs">
                          <span className="font-medium">Last comment:</span> {r.teacherComment}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pl-4 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        <Button onClick={() => approve(r.id)} disabled={r.status === "PAID" || r.status === "DENIED"}>Approve</Button>
                        <Button onClick={() => pay(r.id)} disabled={r.status === "PAID"}>Submit (Pay)</Button>
                        <Button variant="secondary" onClick={() => rebuke(r.id)} disabled={r.status === "PAID" || r.status === "DENIED"}>Rebuke</Button>
                        <Button variant="secondary" onClick={() => deny(r.id)} disabled={r.status === "PAID"}>Deny</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
