import { useClassContext } from "@/context/ClassContext"
import { Navigate } from "react-router-dom"

interface RequireTeacherProps {
  children: React.ReactNode
}

export function RequireTeacher({ children }: RequireTeacherProps) {
  const { role } = useClassContext()
  
  if (role !== "TEACHER") {
    return <Navigate to="/store" replace />
  }
  
  return <>{children}</>
}
