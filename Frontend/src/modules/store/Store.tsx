import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Store() {
  const items = [
    { name: "Homework Pass", price: 50 },
    { name: "Extra Recess (10m)", price: 30 },
    { name: "Sticker Pack", price: 10 },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Class Store</h2>
        <Button variant="secondary">Manage Items</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.name}>
            <CardHeader><CardTitle>{it.name}</CardTitle></CardHeader>
            <CardContent>Price: CE$ {it.price}</CardContent>
            <CardFooter><Button>Add to Cart</Button></CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
