import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "TEACHER" | "STUDENT";

export type ClassSummary = {
  id: string;
  name: string;
  term?: string;
  room?: string;
  defaultCurrency?: string;
};

type ClassContextState = {
  role: Role;
  classes: ClassSummary[];
  currentClassId: string | null;
  setCurrentClassId: (id: string) => void;
  setRole: (r: Role) => void;
  currentStudentId: string | null;
  setCurrentStudentId: (id: string) => void;
  addClass: (c: ClassSummary) => string; // returns final id (unique)
};

const ClassContext = createContext<ClassContextState | null>(null);

export function useClassContext() {
  const ctx = useContext(ClassContext);
  if (!ctx)
    throw new Error("useClassContext must be used within <ClassProvider>");
  return ctx;
}

/** Temporary mock provider — replace with real auth/API later. */
export function ClassProvider({
  children,
  initialRole = "TEACHER",
  initialClasses = [
    {
      id: "algebra-i",
      name: "Algebra I",
      term: "Fall",
      room: "201",
      defaultCurrency: "CE$",
    },
    {
      id: "history-7",
      name: "History 7",
      term: "Fall",
      room: "105",
      defaultCurrency: "CE$",
    },
    {
      id: "science-6",
      name: "Science 6",
      term: "Fall",
      room: "Lab A",
      defaultCurrency: "CE$",
    },
  ],
  initialStudentId = "s1",
}: {
  children: React.ReactNode;
  initialRole?: Role;
  initialClasses?: ClassSummary[];
  initialStudentId?: string;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const [classes, setClasses] = useState<ClassSummary[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string | null>(
    initialClasses[0]?.id ?? null
  );
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(
    initialStudentId
  );

  const addClass = (c: ClassSummary) => {
    // ensure unique id
    let base = c.id;
    let id = base;
    let i = 2;
    const ids = new Set(classes.map((x) => x.id));
    while (ids.has(id)) {
      id = `${base}-${i++}`;
    }
    const finalClass = { ...c, id };
    setClasses((prev) => [...prev, finalClass]);
    return id;
  };

  const value = useMemo(
    () => ({
      role,
      classes,
      currentClassId,
      setCurrentClassId,
      setRole,
      currentStudentId,
      setCurrentStudentId,
      addClass,
    }),
    [role, classes, currentClassId, currentStudentId]
  );

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
}
