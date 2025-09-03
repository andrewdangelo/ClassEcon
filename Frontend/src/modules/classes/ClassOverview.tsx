import * as React from "react"
import { useParams } from "react-router-dom"
import { useClassContext } from "@/context/ClassContext"
import { StudentClassOverview } from "./StudentClassOverview"
import { TeacherClassOverview } from "./TeacherClassOverview"

export default function ClassOverview() {
  const { classId } = useParams<{ classId: string }>()
  const { role, setCurrentClassId } = useClassContext()

  React.useEffect(() => {
    if (classId) setCurrentClassId(classId)
  }, [classId, setCurrentClassId])

  if (!classId) return <div>Class not found.</div>

  return role === "STUDENT" ? (
    <StudentClassOverview classId={classId} />
  ) : (
    <TeacherClassOverview classId={classId} />
  )
}
