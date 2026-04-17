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
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking your class and account…
        </p>
      </div>
    )
  }

  if (!classId) {
    return (
      <div className="py-6">
        <div className="text-muted-foreground">Please select a class to view requests.</div>
      </div>
    )
  }

  if (!studentId) {
    return (
      <div className="py-6">
        <div className="text-muted-foreground">Unable to identify current user.</div>
      </div>
    )
  }

  return (
    <div className="page-stack-tight">
      <div className="border-b border-border/80 pb-4">
        <h1 className="page-title text-2xl md:text-3xl">Payment requests</h1>
        <p className="page-subtitle !mt-1">Submit and track your payment requests</p>
      </div>
      <StudentRequestForm classId={classId} studentId={studentId} />
      <StudentRequestsList classId={classId} studentId={studentId} />
    </div>
  )
}
