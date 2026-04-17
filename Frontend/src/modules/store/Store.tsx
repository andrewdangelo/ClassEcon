import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentClass } from "@/hooks/useCurrentClass"
import { useApi } from "@/hooks/useApi"
import { apiFetchStoreItemsByClass } from "@/api/client"
import { useToast } from "@/components/ui/toast"
import { useCart } from "@/context/CartContext"
import { useClassContext } from "@/context/ClassContext"
import { useNavigate } from "react-router-dom"
import { Settings } from "lucide-react"

export default function Store() {
  const { currentClassId, current } = useCurrentClass()
  const { push } = useToast()
  const { addItem } = useCart()
  const { role } = useClassContext()
  const navigate = useNavigate()
  const isTeacher = role === "TEACHER"

  const query = useApi(
    () => (currentClassId ? apiFetchStoreItemsByClass(currentClassId) : Promise.resolve([])),
    [currentClassId]
  )

  if (!currentClassId)
    return (
      <p className="text-muted-foreground">Select a class to view the store.</p>
    )

  if (query.error) {
    return <div className="text-sm text-destructive">Failed to load store: {query.error.message}</div>
  }

  const items = query.data ?? []

  const handleAdd = (id: string, name: string, price: number) => {
    addItem({ id, name, price }, 1)
    push({ title: "Added to cart", description: `${name} (CE$ ${price})` })
  }

  return (
    <div className="page-stack-tight">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="page-title text-2xl md:text-3xl">
          Class Store — {current?.name} {current?.term ? `· ${current.term}` : ""}
        </h2>

        {isTeacher ? (
          <Button variant="secondary" onClick={() => navigate('/store/manage')}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Items
          </Button>
        ) : (
          <Button variant="secondary" disabled title="Teachers only">
            <Settings className="w-4 h-4 mr-2" />
            Manage Items
          </Button>
        )}
      </div>

      {query.loading ? (
        <div className="text-sm text-muted-foreground">Loading items…</div>
      ) : (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.id}>
              <CardHeader><CardTitle>{it.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>Price: CE$ {it.price}</div>
                  <div>Stock: {it.stock ?? "Unlimited"}</div>
                  {it.description && <div className="text-muted-foreground">{it.description}</div>}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleAdd(it.id, it.name, it.price)} disabled={it.stock <= 0}>
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
          {items.length === 0 && <div className="text-sm text-muted-foreground">No items for this class yet.</div>}
        </div>
      )}
    </div>
  )
}
