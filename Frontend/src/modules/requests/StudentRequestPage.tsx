import { useParams } from "react-router-dom"
import { useQuery } from "@apollo/client/react"
import { ME } from "@/graphql/queries/me"
import { MeQuery } from "@/graphql/__generated__/graphql"
import { useClassContext } from "@/context/ClassContext"
import StudentRequestForm from "./StudentRequestForm"
import StudentRequestsList from "./StudentRequestsList"

export default function StudentRequestsPage() {
  const { currentClassId, classes } = useClassContext()
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-and-network",
  })

  const currentClass = classes.find(c => c.id === currentClassId)
  const classId = currentClass?.id
  const studentId = meData?.me?.id

  if (meLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!classId) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground">Please select a class to view requests.</div>
      </div>
    )
  }

  if (!studentId) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground">Unable to identify current user.</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="border-b pb-2">
        <h1 className="text-2xl font-bold">Payment Requests</h1>
        <p className="text-muted-foreground">Submit and track your payment requests</p>
      </div>
      <StudentRequestForm classId={classId} studentId={studentId} />
      <StudentRequestsList classId={classId} studentId={studentId} />
    </div>
  )
}
