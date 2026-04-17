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
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading your request inbox…
        </p>
      </div>
    );
  }

  if (role === "TEACHER") {
    return <TeacherRequestsPage />;
  }

  return <StudentRequestsPage />;
}
