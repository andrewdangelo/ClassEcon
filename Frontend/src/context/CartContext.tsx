import * as React from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
}

type CartCtx = {
  items: Record<string, CartItem>
  totalCount: number
  addItem: (item: { id: string; name: string; price: number }, qty?: number) => void
  removeItem: (id: string, qty?: number) => void
  clear: () => void
}

const CartContext = React.createContext<CartCtx | null>(null)

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within <CartProvider>")
  return ctx
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Record<string, CartItem>>({})

  const addItem: CartCtx["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev[item.id]
      const nextQty = (existing?.qty ?? 0) + qty
      return { ...prev, [item.id]: { ...item, qty: nextQty } }
    })
  }

  const removeItem: CartCtx["removeItem"] = (id, qty = 1) => {
    setItems((prev) => {
      const existing = prev[id]
      if (!existing) return prev
      const nextQty = existing.qty - qty
      if (nextQty <= 0) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: { ...existing, qty: nextQty } }
    })
  }

  const clear = () => setItems({})
  const totalCount = Object.values(items).reduce((acc, it) => acc + it.qty, 0)

  return (
    <CartContext.Provider value={{ items, totalCount, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}
