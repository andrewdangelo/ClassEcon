import * as React from "react"
import { useParams } from "react-router-dom"
import { useClassContext } from "@/context/ClassContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { StatusPill } from "@/components/StatusPill"
import { apiCreatePayRequest, apiGetReasons, apiGetRequestsByStudent, apiResubmitRequest } from "@/api/requests"

export default function StudentRequestPayment() {
  const { classId } = useParams<{ classId: string }>()
  const { currentStudentId } = useClassContext()
  const { push } = useToast()

  const [reasons, setReasons] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [list, setList] = React.useState<any[]>([])

  const [reason, setReason] = React.useState("")
  const [amount, setAmount] = React.useState<string>("")
  const [justification, setJustification] = React.useState("")

  React.useEffect(() => {
    let mounted = true
    async function load() {
      if (!classId || !currentStudentId) return
      try {
        const [rs, reqs] = await Promise.all([apiGetReasons(classId), apiGetRequestsByStudent(classId, currentStudentId)])
        if (!mounted) return
        setReasons(rs)
        setList(reqs)
        if (rs.length && !reason) setReason(rs[0])
      } catch (e: any) {
        push({ title: "Failed to load", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [classId, currentStudentId, push])

  if (!classId || !currentStudentId) return <div>Missing class or student context.</div>
  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>

  const submit = async () => {
    const amt = Number(amount)
    if (!reason) return push({ title: "Reason required", description: "Please pick a reason.", variant: "destructive" })
    if (!Number.isFinite(amt) || amt <= 0) return push({ title: "Invalid amount", description: "Enter a positive amount.", variant: "destructive" })
    if (!justification.trim()) return push({ title: "Justification required", description: "Please explain why.", variant: "destructive" })

    try {
      const created = await apiCreatePayRequest({ classId, studentId: currentStudentId, reason, amount: amt, justification })
      setList((prev) => [created, ...prev])
      setAmount("")
      setJustification("")
      push({ title: "Request submitted", description: `${reason} — CE$ ${amt}` })
    } catch (e: any) {
      push({ title: "Submit failed", description: e.message, variant: "destructive" })
    }
  }

  const resubmit = async (id: string) => {
    const amt = Number(amount)
    if (!reason || !Number.isFinite(amt) || amt <= 0 || !justification.trim()) {
      return push({ title: "Fill the form first", description: "Reason, amount, and justification are required.", variant: "destructive" })
    }
    try {
      const updated = await apiResubmitRequest(id, { reason, amount: amt, justification })
      if (updated) {
        setList((prev) => prev.map((r) => (r.id === id ? updated : r)))
        setAmount("")
        setJustification("")
        push({ title: "Resubmitted", description: `${updated.reason} — CE$ ${updated.amount}` })
      }
    } catch (e: any) {
      push({ title: "Resubmit failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Request a One-time Payment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount (CE$) *</label>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Justification *</label>
            <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Explain why you should receive this payment…" />
          </div>
          <div className="flex gap-2">
            <Button onClick={submit}>Submit Request</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:row-span-2">
        <CardHeader><CardTitle>My Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <div className="text-sm text-muted-foreground">No requests yet.</div>
          ) : list.map((r) => (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.reason} — CE$ {r.amount}</div>
                <StatusPill status={r.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{r.justification}</div>
              {r.teacherComment && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Teacher comment:</span> {r.teacherComment}
                </div>
              )}
              {r.status === "REBUKED" && (
                <div className="mt-2">
                  <Button variant="secondary" onClick={() => resubmit(r.id)}>Resubmit with current form</Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
