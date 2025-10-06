import React from "react";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import { useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { MeQuery } from "@/graphql/__generated__/graphql";
import TeacherLayout from "./TeacherLayout";
import StudentLayout from "./StudentLayout";

/**
 * RoleBasedLayout component that renders the appropriate layout
 * based on the user's role (Teacher or Student)
 */
export function RoleBasedLayout() {
  const user = useAppSelector(selectUser);
  
  // Also check the ME query in case Redux state is stale
  const { data: meData, loading } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-first",
  });

  // Determine the role from either the Redux store or the GraphQL query
  const role = meData?.me?.role || user?.role;

  // Show loading state while determining user role
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate layout based on user role
  switch (role) {
    case "TEACHER":
      return <TeacherLayout />;
    case "STUDENT":
      return <StudentLayout />;
    case "PARENT":
      // For now, parents use the student layout
      // In the future, we could create a dedicated ParentLayout
      return <StudentLayout />;
    default:
      // Fallback - should not happen in normal flow
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Unknown User Role</h2>
            <p className="text-sm text-muted-foreground">
              Please contact support for assistance.
            </p>
          </div>
        </div>
      );
  }
}

export default RoleBasedLayout;
