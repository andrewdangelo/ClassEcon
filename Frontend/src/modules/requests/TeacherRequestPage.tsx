import { useClassContext } from "@/context/ClassContext"
import TeacherRequests from "./TeacherRequests"

export default function TeacherRequestsPage() {
  const { currentClassId, classes } = useClassContext()
  
  const currentClass = classes.find(c => c.id === currentClassId)
  const classId = currentClass?.id

  if (!classId) {
    return (
      <div className="py-6">
        <div className="text-muted-foreground">Please select a class to view requests.</div>
      </div>
    )
  }

  return (
    <div className="page-stack-tight">
      <div className="border-b border-border/80 pb-4">
        <h1 className="page-title text-2xl md:text-3xl">Manage payment requests</h1>
        <p className="page-subtitle !mt-1">
          Review and approve student payment requests for {currentClass.name}
        </p>
      </div>
      <TeacherRequests classId={classId} />
    </div>
  )
}
