import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClassContext } from "@/context/ClassContext"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

export default function Classes() {
  const { classes, currentClassId, setCurrentClassId } = useClassContext()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Classes</h2>
        <Button>New Class</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((c) => {
          const active = c.id === currentClassId
          return (
            <Link
              key={c.id}
              to={`/classes/${c.id}`}
              onClick={() => setCurrentClassId(c.id)}
            >
              <Card className={cn("hover:shadow-md transition", active && "border-primary")}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{c.name}</CardTitle>
                  {active && <span className="rounded-md border px-2 py-1 text-xs">Active</span>}
                </CardHeader>
                <CardContent>Term: {c.term ?? "—"} • Currency: CE$</CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}


