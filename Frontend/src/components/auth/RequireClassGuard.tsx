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

interface MeQueryResp { me?: { id: string; role: string } }

const CLASSES_FOR_GUARD = gql`
  query RequireClass_Classes {
    classes {
      id
      teacherIds
    }
  }
`;

interface ClassesQueryResp { classes: { id: string; teacherIds: string[] }[] }

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
  const { data: meData, loading: meLoading } = useQuery<MeQueryResp>(ME_QUERY);
  const role = meData?.me?.role;
  const userId = meData?.me?.id;

  // Only relevant for teachers
  const { data: classesData, loading: classesLoading } = useQuery<ClassesQueryResp>(
    CLASSES_FOR_GUARD,
    {
      skip: !userId || role !== "TEACHER",
      fetchPolicy: "cache-first",
    }
  );

  const pathname = location.pathname;
  const isOnboarding = pathname === "/onboarding";
  const newClassIdFromNav = (location.state as any)?.newClassId;

  if (meLoading || (role === "TEACHER" && classesLoading)) {
    return null; // or a spinner
  }

  if (role !== "TEACHER") {
    // Students/Parents bypass this guard entirely
    return <>{children}</>;
  }

  // Teacher: do I have at least one class I teach?
  const myClassExists = !!classesData?.classes?.some(
    (c) => c?.teacherIds?.includes?.(userId || "")
  );

  // Teacher without classes: only allow onboarding; redirect any other protected route to onboarding
  if (!myClassExists && !isOnboarding) {
    // If we just created a class and are redirecting, allow children while cache catches up
    if (newClassIdFromNav) {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding" replace state={location.state} />;
  }

  // Teacher with classes: block returning to onboarding; send to dashboard root
  if (myClassExists && isOnboarding) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
