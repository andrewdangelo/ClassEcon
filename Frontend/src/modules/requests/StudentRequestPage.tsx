import { useParams } from "react-router-dom"
import StudentRequestForm from "./StudentRequestForm"
import StudentRequestsList from "./StudentRequestsList"

export default function StudentRequestsPage() {
  const { classId } = useParams<{ classId: string }>()
  // TEMP filler ID until auth
  const studentId = "000000000000000000000001"

  if (!classId) return <div>No class selected</div>

  return (
    <div className="p-4 space-y-4">
      <StudentRequestForm classId={classId} studentId={studentId} />
      <StudentRequestsList classId={classId} studentId={studentId} />
    </div>
  )
}
