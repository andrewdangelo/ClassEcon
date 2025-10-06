import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/textarea"
import { useCurrentClass } from "@/hooks/useCurrentClass"
import { useApi } from "@/hooks/useApi"
import { apiFetchStoreItemsByClass } from "@/api/client"
import { useToast } from "@/components/ui/toast"
import { useMutation } from "@apollo/client/react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { CREATE_STORE_ITEM, UPDATE_STORE_ITEM, DELETE_STORE_ITEM } from "@/graphql/mutations/storeItems"

interface StoreItemFormData {
  title: string
  price: string
  description: string
  imageUrl: string
  stock: string
  perStudentLimit: string
  active: boolean
}

const initialFormData: StoreItemFormData = {
  title: "",
  price: "",
  description: "",
  imageUrl: "",
  stock: "",
  perStudentLimit: "",
  active: true,
}

export default function StoreManage() {
  const { currentClassId, current } = useCurrentClass()
  const { push } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<StoreItemFormData>(initialFormData)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<any>(null)

  const query = useApi(
    () => (currentClassId ? apiFetchStoreItemsByClass(currentClassId) : Promise.resolve([])),
    [currentClassId]
  )

  const [createStoreItem, { loading: createLoading }] = useMutation(CREATE_STORE_ITEM, {
    onCompleted: () => {
      push({ title: "Success", description: "Store item created successfully" })
      setIsCreateDialogOpen(false)
      setFormData(initialFormData)
      query.refetch()
    },
    onError: (error) => {
      push({ title: "Error", description: error.message })
    },
  })

  const [updateStoreItem, { loading: updateLoading }] = useMutation(UPDATE_STORE_ITEM, {
    onCompleted: () => {
      push({ title: "Success", description: "Store item updated successfully" })
      setEditingItem(null)
      setFormData(initialFormData)
      query.refetch()
    },
    onError: (error) => {
      push({ title: "Error", description: error.message })
    },
  })

  const [deleteStoreItem, { loading: deleteLoading }] = useMutation(DELETE_STORE_ITEM, {
    onCompleted: () => {
      push({ title: "Success", description: "Store item deleted successfully" })
      setDeleteConfirmItem(null)
      query.refetch()
    },
    onError: (error) => {
      push({ title: "Error", description: error.message })
    },
  })

  if (!currentClassId) return <div>Select a class to manage the store.</div>

  const handleInputChange = (field: keyof StoreItemFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const input = {
      ...(editingItem ? {} : { classId: currentClassId }),
      title: formData.title,
      price: parseInt(formData.price) || 0,
      description: formData.description || null,
      imageUrl: formData.imageUrl || null,
      stock: formData.stock ? parseInt(formData.stock) : null,
      perStudentLimit: formData.perStudentLimit ? parseInt(formData.perStudentLimit) : null,
      active: formData.active,
    }

    if (editingItem) {
      updateStoreItem({ variables: { id: editingItem.id, input } })
    } else {
      createStoreItem({ variables: { input } })
    }
  }

  const startEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      title: item.name || "",
      price: item.price?.toString() || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      stock: item.stock?.toString() || "",
      perStudentLimit: item.perStudentLimit?.toString() || "",
      active: item.active ?? true,
    })
  }

  const handleDelete = (item: any) => {
    deleteStoreItem({ variables: { id: item.id } })
  }

  if (query.error) {
    return <div className="text-sm text-destructive">Failed to load store: {query.error.message}</div>
  }

  const items = query.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Manage Store — {current?.name} {current?.term ? `· ${current.term}` : ""}
        </h2>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Store Item</DialogTitle>
              <DialogDescription>
                Create a new item for your class store.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (CE$)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock (leave blank for unlimited)</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perStudentLimit">Per Student Limit</Label>
                <Input
                  id="perStudentLimit"
                  type="number"
                  min="0"
                  value={formData.perStudentLimit}
                  onChange={(e) => handleInputChange("perStudentLimit", e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Creating..." : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {query.loading ? (
        <div className="text-sm text-muted-foreground">Loading items…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {item.name}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirmItem(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>Price: CE$ {item.price}</div>
                  <div>Stock: {item.stock ?? "Unlimited"}</div>
                  {item.description && <div className="text-muted-foreground">{item.description}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground col-span-full">
              No items for this class yet. Add some items to get started!
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Store Item</DialogTitle>
            <DialogDescription>
              Update the details of this store item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (CE$)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock (leave blank for unlimited)</Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-perStudentLimit">Per Student Limit</Label>
              <Input
                id="edit-perStudentLimit"
                type="number"
                min="0"
                value={formData.perStudentLimit}
                onChange={(e) => handleInputChange("perStudentLimit", e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateLoading}>
                {updateLoading ? "Updating..." : "Update Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteConfirmItem)}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
