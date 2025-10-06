import { useClassContext } from "@/context/ClassContext"
import TeacherRequests from "./TeacherRequests"

export default function TeacherRequestsPage() {
  const { currentClassId, classes } = useClassContext()
  
  const currentClass = classes.find(c => c.id === currentClassId)
  const classId = currentClass?.id

  if (!classId) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground">Please select a class to view requests.</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="border-b pb-2 mb-4">
        <h1 className="text-2xl font-bold">Manage Payment Requests</h1>
        <p className="text-muted-foreground">Review and approve student payment requests for {currentClass.name}</p>
      </div>
      <TeacherRequests classId={classId} />
    </div>
  )
}
