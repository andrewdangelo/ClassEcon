import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Students() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Students</h2>
        <Input placeholder="Search students..." className="max-w-sm" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Ava M.", "Liam K.", "Noah S.", "Emma R."].map((s) => (
          <Card key={s}>
            <CardHeader><CardTitle>{s}</CardTitle></CardHeader>
            <CardContent>Balance: CE$ 120</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
