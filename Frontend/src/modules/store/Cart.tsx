import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/CartContext"
import { useCurrentClass } from "@/hooks/useCurrentClass"
import { useToast } from "@/components/ui/toast"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client/react"
import { MAKE_PURCHASE } from "@/graphql/mutations/storeItems"

export default function Cart() {
  const { items, totalCount, addItem, removeItem, clear } = useCart()
  const { current, currentClassId } = useCurrentClass()
  const { push } = useToast()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const [makePurchase] = useMutation(MAKE_PURCHASE, {
    onCompleted: () => {
      push({ 
        title: "Purchase successful!", 
        description: `Purchased ${totalCount} item${totalCount > 1 ? 's' : ''} for CE$ ${totalPrice}` 
      })
      clear()
      navigate('/store')
    },
    onError: (error) => {
      push({ title: "Purchase failed", description: error.message })
    },
  })

  const itemsArray = Object.values(items)
  const totalPrice = itemsArray.reduce((sum, item) => sum + (item.price * item.qty), 0)

  const updateQuantity = (item: any, newQty: number) => {
    if (newQty <= 0) {
      removeItem(item.id, item.qty) // Remove all
    } else if (newQty > item.qty) {
      addItem(item, newQty - item.qty) // Add difference
    } else {
      removeItem(item.id, item.qty - newQty) // Remove difference
    }
  }

  const handlePurchase = async () => {
    if (itemsArray.length === 0) {
      push({ title: "Error", description: "Your cart is empty" })
      return
    }

    if (!currentClassId) {
      push({ title: "Error", description: "Please select a class first" })
      return
    }

    setIsProcessing(true)
    try {
      const purchaseInput = {
        classId: currentClassId,
        items: itemsArray.map(item => ({
          storeItemId: item.id,
          quantity: item.qty,
        })),
      }
      
      await makePurchase({ variables: { input: purchaseInput } })
    } catch (error) {
      // Error handling is in the onError callback
    } finally {
      setIsProcessing(false)
    }
  }

  if (itemsArray.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Shopping Cart</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/store')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Shopping Cart</h2>
        <Button variant="outline" onClick={() => navigate('/store')}>
          Continue Shopping
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {itemsArray.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id, item.qty)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    CE$ {item.price} each
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item, item.qty - 1)}
                      disabled={item.qty <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQuantity(item, parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item, item.qty + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">Quantity: {item.qty}</span>
                  <span className="font-medium">
                    Subtotal: CE$ {item.price * item.qty}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {itemsArray.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.qty}</span>
                    <span>CE$ {item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total ({totalCount} items)</span>
                  <span>CE$ {totalPrice}</span>
                </div>
              </div>

              {current && (
                <div className="text-xs text-muted-foreground">
                  Purchasing from: {current.name}
                  {current.term && ` • ${current.term}`}
                </div>
              )}
            </CardContent>
            <CardFooter className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Purchase for CE$ ${totalPrice}`}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={clear}
                disabled={isProcessing}
              >
                Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
