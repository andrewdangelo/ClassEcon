import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import { ClassesByUserQuery } from "@/graphql/__generated__/graphql";

export type Role = "TEACHER" | "STUDENT";

export type ClassSummary = {
  id: string;
  name: string;
  subject?: string;
  period?: string;
  defaultCurrency?: string;
  isArchived?: boolean;
  // Legacy fields for backwards compatibility
  term?: string;
  room?: string;
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
  loading: boolean;
  error?: any;
};

const ClassContext = createContext<ClassContextState | null>(null);

export function useClassContext() {
  const ctx = useContext(ClassContext);
  if (!ctx)
    throw new Error("useClassContext must be used within <ClassProvider>");
  return ctx;
}

/** Real provider that fetches classes from GraphQL API */
export function ClassProvider({
  children,
  initialRole = "STUDENT",
}: {
  children: React.ReactNode;
  initialRole?: Role;
  // Remove initialClasses and initialStudentId as we'll fetch real data
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  // Get current user from Redux
  const user = useAppSelector(selectUser);

  // Fetch user's classes from GraphQL
  const { data: classesData, loading, error } = useQuery<ClassesByUserQuery>(GET_CLASSES_BY_USER, {
    variables: { 
      userId: user?.id || "",
      role: user?.role as Role || role,
      includeArchived: false 
    },
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });

  // Transform GraphQL data to ClassSummary format
  const classes: ClassSummary[] = useMemo(() => {
    if (!classesData?.classesByUser) return [];
    
    return classesData.classesByUser.map(cls => ({
      id: cls.id,
      name: cls.name,
      subject: cls.subject || undefined,
      period: cls.period || undefined,
      defaultCurrency: cls.defaultCurrency || "CE$",
      isArchived: cls.isArchived || false,
    }));
  }, [classesData]);

  // Set the first class as current when classes load
  useEffect(() => {
    if (classes.length > 0 && !currentClassId) {
      setCurrentClassId(classes[0].id);
    }
  }, [classes, currentClassId]);

  // Update role when user data changes
  useEffect(() => {
    if (user?.role && user.role !== role) {
      setRole(user.role as Role);
    }
  }, [user?.role, role]);

  const addClass = (c: ClassSummary) => {
    // This would typically involve a GraphQL mutation to create a class
    // For now, we'll keep the local logic but note it should be replaced
    console.warn("addClass called - this should create a class via GraphQL mutation");
    return c.id;
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
      loading,
      error,
    }),
    [role, classes, currentClassId, currentStudentId, loading, error]
  );

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
}
