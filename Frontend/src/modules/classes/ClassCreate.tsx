import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useClassContext } from "@/context/ClassContext"
import { apiCreateClass } from "@/api/classes"
import { slugify } from "@/lib/slug"

type FormState = {
  name: string
  term: string
  room: string
  defaultCurrency: string
  allowNegative: boolean
  requireFineReason: boolean
  perItemPurchaseLimit: string // keep as string for easy input; parse to number|null
}

const TERMS = ["Fall", "Winter", "Spring", "Summer"]

export default function ClassCreate() {
  const { role, addClass, setCurrentClassId } = useClassContext()
  const { push } = useToast()
  const navigate = useNavigate()

  if (role !== "TEACHER") {
    return <div className="text-sm text-muted-foreground">This page is for teachers only.</div>
  }

  const [form, setForm] = React.useState<FormState>({
    name: "",
    term: "Fall",
    room: "",
    defaultCurrency: "CE$",
    allowNegative: false,
    requireFineReason: true,
    perItemPurchaseLimit: "",
  })

  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Class name is required."
    if (form.perItemPurchaseLimit && isNaN(Number(form.perItemPurchaseLimit))) {
      errs.perItemPurchaseLimit = "Must be a number."
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const created = await apiCreateClass({
        name: form.name.trim(),
        term: form.term || undefined,
        room: form.room || undefined,
        defaultCurrency: form.defaultCurrency || "CE$",
        policies: {
          allowNegative: form.allowNegative,
          requireFineReason: form.requireFineReason,
          perItemPurchaseLimit: form.perItemPurchaseLimit ? Number(form.perItemPurchaseLimit) : null,
        },
      })

      // generate slug id and store in context
      const baseId = slugify(created.name || "class")
      const finalId = addClass({ ...created, id: baseId })
      setCurrentClassId(finalId)

      push({ title: "Class created", description: `${created.name} (${created.term || "—"})` })
      navigate(`/classes/${finalId}`)
    } catch (err: any) {
      push({ title: "Failed to create class", description: err.message || "Unknown error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>New Class</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Class Name *</label>
            <Input
              name="name"
              placeholder="e.g., Algebra I"
              value={form.name}
              onChange={onChange}
              aria-invalid={!!errors.name}
              aria-describedby="name-err"
            />
            {errors.name && <div id="name-err" className="mt-1 text-xs text-destructive">{errors.name}</div>}
          </div>

          {/* Term */}
          <div>
            <label className="mb-1 block text-sm font-medium">Term</label>
            <select
              name="term"
              value={form.term}
              onChange={onChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {TERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="">Other / None</option>
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="mb-1 block text-sm font-medium">Room</label>
            <Input name="room" placeholder="e.g., 201" value={form.room} onChange={onChange} />
          </div>

          {/* Currency */}
          <div>
            <label className="mb-1 block text-sm font-medium">Default Currency</label>
            <Input
              name="defaultCurrency"
              placeholder="CE$"
              value={form.defaultCurrency}
              onChange={onChange}
            />
            <div className="mt-1 text-xs text-muted-foreground">Used for balances and store prices.</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allowNegative" checked={form.allowNegative} onChange={onChange} />
            Allow negative balances (debt)
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="requireFineReason" checked={form.requireFineReason} onChange={onChange} />
            Require reason when issuing fines
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium">Per-item purchase limit</label>
            <Input
              name="perItemPurchaseLimit"
              placeholder="e.g., 2"
              value={form.perItemPurchaseLimit}
              onChange={onChange}
              aria-invalid={!!errors.perItemPurchaseLimit}
              aria-describedby="limit-err"
            />
            <div className="mt-1 text-xs text-muted-foreground">Leave blank for no limit.</div>
            {errors.perItemPurchaseLimit && (
              <div id="limit-err" className="mt-1 text-xs text-destructive">{errors.perItemPurchaseLimit}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 md:col-span-2">
        <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create Class"}</Button>
        <Button type="button" variant="secondary" onClick={() => history.back()} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
