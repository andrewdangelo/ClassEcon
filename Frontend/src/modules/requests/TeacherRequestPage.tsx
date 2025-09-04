import { useParams } from "react-router-dom"
import TeacherRequests from "./TeacherRequests"

export default function TeacherRequestsPage() {
  const { classId } = useParams<{ classId: string }>()
  if (!classId) return <div>No class selected</div>
  return (
    <div className="p-4">
      <TeacherRequests classId={classId} />
    </div>
  )
}
