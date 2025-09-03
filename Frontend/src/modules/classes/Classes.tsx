import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Classes() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Classes</h2>
        <Button>New Class</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Algebra I", "History 7"].map((c) => (
          <Card key={c}>
            <CardHeader><CardTitle>{c}</CardTitle></CardHeader>
            <CardContent>Term: Fall • Currency: CE$</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
