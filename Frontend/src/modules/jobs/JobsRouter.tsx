import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { JobBoardPage } from "./JobBoardPage";
import { JobManagementPage } from "./JobManagementPage";

export function JobsRouter() {
  const { user } = useAuth();
  
  if (user?.role === "TEACHER") {
    return <JobManagementPage />;
  }
  
  return <JobBoardPage />;
}
