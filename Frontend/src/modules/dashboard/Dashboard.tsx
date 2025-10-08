import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import { useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { MeQuery } from "@/graphql/__generated__/graphql";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import * as React from "react";

/**
 * Main Dashboard component that routes to the appropriate dashboard
 * based on the user's role (Teacher or Student)
 */
export default function Dashboard() {
  const user = useAppSelector(selectUser);
  
  // Also check the ME query in case Redux state is stale
  const { data: meData, loading } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-and-network",
  });

  // Determine the role from either the Redux store or the GraphQL query
  const role = meData?.me?.role || user?.role;

  // Show loading state while determining user role
  if (loading && !user) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  switch (role) {
    case "TEACHER":
      return <TeacherDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    case "PARENT":
      // For now, parents use the student dashboard
      // In the future, we could create a dedicated ParentDashboard
      return <StudentDashboard />;
    default:
      // Fallback - should not happen in normal flow
      return (
        <div className="min-h-64 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Unknown User Role</CardTitle>
              <CardDescription>
                Unable to determine your role in the classroom economy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please contact your teacher or administrator for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
}
