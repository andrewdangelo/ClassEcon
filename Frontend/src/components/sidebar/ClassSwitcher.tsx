import React from "react"
import { useClassContext } from "@/context/ClassContext"
import { cn } from "@/lib/utils"

export function ClassSwitcher({ className }: { className?: string }) {
  const { classes, currentClassId, setCurrentClassId } = useClassContext()

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">Current class</label>
      <select
        value={currentClassId ?? ""}
        onChange={(e) => setCurrentClassId(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Select current class"
      >
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.term ? ` — ${c.term}` : ""}
          </option>
        ))}
      </select>
    </div>
  )
}

