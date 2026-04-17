import { useQuery } from "@apollo/client/react"
import { GET_CLASSES } from "@/graphql/queries/classes"

export default function GraphQLTest() {
  const { data, loading, error } = useQuery(GET_CLASSES, { fetchPolicy: "cache-first" })

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>
  if (error) return <div className="text-sm text-destructive">Error: {error.message}</div>

  return (
    <div className="page-stack-tight">
      <h2 className="page-title text-2xl md:text-3xl">Classes (GraphQL)</h2>
      <ul className="list-disc pl-6">
        {data?.classes?.map((c: any) => (
          <li key={c.id}>{c.name} {c.term ? `· ${c.term}` : ""}</li>
        ))}
      </ul>
    </div>
  )
}
