import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
          <CardDescription>Per-class totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$1,250</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>Active positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">12</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
          <CardDescription>Items in stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">48</div>
        </CardContent>
      </Card>
    </div>
  )
}
