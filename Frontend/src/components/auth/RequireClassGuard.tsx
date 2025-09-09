// src/components/auth/RequireClassGuard.tsx
import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const ME_QUERY = gql`
  query RequireClass_Me {
    me {
      id
      role
    }
  }
`;

const CLASSES_FOR_GUARD = gql`
  query RequireClass_Classes {
    classes {
      id
      teacherIds
    }
  }
`;

/**
 * Ensures:
 * - Teachers without a class are forced onto /onboarding
 * - Teachers with a class are pushed away from /onboarding to /classes
 * - Non-teachers are never forced into onboarding
 */
export const RequireClassGuard: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const location = useLocation();
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
  const role = meData?.me?.role;
  const userId = meData?.me?.id;

  // Only relevant for teachers
  const { data: classesData, loading: classesLoading } = useQuery(
    CLASSES_FOR_GUARD,
    {
      skip: !userId || role !== "TEACHER",
      fetchPolicy: "cache-first",
    }
  );

  const pathname = location.pathname;
  const isOnboarding = pathname === "/onboarding";

  if (meLoading || (role === "TEACHER" && classesLoading)) {
    return null; // or a spinner
  }

  if (role !== "TEACHER") {
    // Students/Parents bypass this guard entirely
    return <>{children}</>;
  }

  // Teacher: do I have at least one class I teach?
  const myClassExists = !!classesData?.classes?.some(
    (c: { teacherIds: string[] }) => c?.teacherIds?.includes?.(userId)
  );

  if (!myClassExists && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (myClassExists && isOnboarding) {
    return <Navigate to="/classes" replace />;
  }

  return <>{children}</>;
};
