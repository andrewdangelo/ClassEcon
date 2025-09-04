import * as React from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { StatusPill } from "@/components/StatusPill/StatusPill"
import {
  apiApproveRequest,
  apiDenyRequest,
  apiGetRequestsByClass,
  apiRebukeRequest,
  apiSubmitPayment,
} from "@/api/requests"
import { getStudentsByClass } from "@/data/mock"
import { useClassContext } from "@/context/ClassContext"

export default function TeacherRequests() {
  const { classId } = useParams<{ classId: string }>()
  const { push } = useToast()
  const { role } = useClassContext()

  const [loading, setLoading] = React.useState(true)
  const [list, setList] = React.useState<any[]>([])
  const [q, setQ] = React.useState("")
  const [notes, setNotes] = React.useState<Record<string, string>>({})

  const [studentNames, setStudentNames] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    let mounted = true
    async function load() {
      if (!classId) return
      try {
        const [reqs, studs] = await Promise.all([apiGetRequestsByClass(classId), Promise.resolve(getStudentsByClass(classId))])
        if (!mounted) return
        setList(reqs)
        setStudentNames(Object.fromEntries(studs.map((s) => [s.id, s.name])))
      } catch (e: any) {
        push({ title: "Failed to load", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [classId, push])

  if (!classId) return <div>Missing class id.</div>
  if (role !== "TEACHER") return <div className="text-sm text-muted-foreground">Teachers only.</div>
  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>

  const filtered = list.filter((r) =>
    (studentNames[r.studentId] || "").toLowerCase().includes(q.toLowerCase()) ||
    r.reason.toLowerCase().includes(q.toLowerCase())
  )

  const update = (updated: any) => setList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))

  const approve = async (id: string) => {
    try {
      const updated = await apiApproveRequest(id, notes[id])
      if (updated) {
        update(updated)
        push({ title: "Approved", description: "Marked as approved" })
      }
    } catch (e: any) {
      push({ title: "Action failed", description: e.message, variant: "destructive" })
    }
  }

  const pay = async (id: string) => {
    try {
      const updated = await apiSubmitPayment(id)
      if (updated) {
        update(updated)
        push({ title: "Payment submitted", description: "Student balance updated" })
      }
    } catch (e: any) {
      push({ title: "Payment failed", description: e.message, variant: "destructive" })
    }
  }

  const rebuke = async (id: string) => {
    const msg = notes[id]?.trim()
    if (!msg) return push({ title: "Comment required", description: "Provide guidance for resubmission.", variant: "destructive" })
    try {
      const updated = await apiRebukeRequest(id, msg)
      if (updated) {
        update(updated)
        push({ title: "Rebuked", description: "Sent back to student for resubmission" })
      }
    } catch (e: any) {
      push({ title: "Action failed", description: e.message, variant: "destructive" })
    }
  }

  const deny = async (id: string) => {
    try {
      const updated = await apiDenyRequest(id, notes[id])
      if (updated) {
        update(updated)
        push({ title: "Denied", description: "Request denied" })
      }
    } catch (e: any) {
      push({ title: "Action failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Requests</h2>
        <Input placeholder="Filter by student or reason…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No requests yet.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {studentNames[r.studentId] ?? r.studentId} • {r.reason} — <span className="font-semibold">CE$ {r.amount}</span>
                  </CardTitle>
                  <StatusPill status={r.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm"><span className="font-medium">Justification:</span> {r.justification}</div>
                {r.teacherComment && <div className="text-sm"><span className="font-medium">Your last comment:</span> {r.teacherComment}</div>}

                <div>
                  <label className="mb-1 block text-sm font-medium">Teacher comment (optional, required for rebuke)</label>
                  <Textarea
                    placeholder="Feedback or reason…"
                    value={notes[r.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => approve(r.id)} disabled={r.status === "PAID" || r.status === "DENIED"}>Approve</Button>
                  <Button onClick={() => pay(r.id)} disabled={r.status === "PAID"}>Submit (Pay)</Button>
                  <Button variant="secondary" onClick={() => rebuke(r.id)} disabled={r.status === "PAID" || r.status === "DENIED"}>Rebuke</Button>
                  <Button variant="secondary" onClick={() => deny(r.id)} disabled={r.status === "PAID"}>Deny</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
