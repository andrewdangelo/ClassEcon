import React, { createContext, useContext, useMemo, useState } from "react"

export type Role = "TEACHER" | "STUDENT"

export type ClassSummary = {
  id: string
  name: string
  term?: string
}

type ClassContextState = {
  role: Role
  classes: ClassSummary[]
  currentClassId: string | null
  setCurrentClassId: (id: string) => void
  setRole: (r: Role) => void
}

const ClassContext = createContext<ClassContextState | null>(null)

export function useClassContext() {
  const ctx = useContext(ClassContext)
  if (!ctx) throw new Error("useClassContext must be used within <ClassProvider>")
  return ctx
}

/** Temporary mock provider — replace `initialClasses` with API data later. */
export function ClassProvider({
  children,
  initialRole = "TEACHER",
  initialClasses = [
    { id: "algebra-i", name: "Algebra I", term: "Fall" },
    { id: "history-7", name: "History 7", term: "Fall" },
    { id: "science-6", name: "Science 6", term: "Fall" },
  ],
}: {
  children: React.ReactNode
  initialRole?: Role
  initialClasses?: ClassSummary[]
}) {
  const [role, setRole] = useState<Role>(initialRole)
  const [classes] = useState<ClassSummary[]>(initialClasses)
  const [currentClassId, setCurrentClassId] = useState<string | null>(initialClasses[0]?.id ?? null)

  const value = useMemo(
    () => ({ role, classes, currentClassId, setCurrentClassId, setRole }),
    [role, classes, currentClassId]
  )

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
}

