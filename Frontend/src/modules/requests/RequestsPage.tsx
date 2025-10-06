import { useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { MeQuery } from "@/graphql/__generated__/graphql";
import { useClassContext } from "@/context/ClassContext";
import StudentRequestsPage from "./StudentRequestPage";
import TeacherRequestsPage from "./TeacherRequestPage";

export default function RequestsPage() {
  const { role: contextRole } = useClassContext();
  const { data, loading } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-and-network",
  });

  const user = data?.me;
  const role = user?.role || contextRole;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (role === "TEACHER") {
    return <TeacherRequestsPage />;
  }

  return <StudentRequestsPage />;
}
