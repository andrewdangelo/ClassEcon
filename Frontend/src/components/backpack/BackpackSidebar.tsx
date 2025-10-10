import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import { STUDENT_BACKPACK } from "@/graphql/queries/backpack";
import { CREATE_REDEMPTION_REQUEST } from "@/graphql/mutations/redemption";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";

export function BackpackSidebar() {
  const { user } = useAuth();
  const { currentClassId } = useCurrentClass();
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const [studentNote, setStudentNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(STUDENT_BACKPACK, {
    variables: { studentId: user?.id, classId: currentClassId },
    skip: !user?.id || !currentClassId,
    fetchPolicy: "cache-and-network",
  });

  // Debug logging
  console.log("BackpackSidebar Debug:", {
    userId: user?.id,
    currentClassId,
    loading,
    error: error?.message,
    data,
    backpackItems: (data as any)?.studentBackpack,
  });

  const [createRedemption, { loading: submitting }] = useMutation(
    CREATE_REDEMPTION_REQUEST,
    {
      refetchQueries: ["StudentBackpack", "RedemptionRequests"],
      onCompleted: () => {
        console.log("Redemption request submitted!");
        setDialogOpen(false);
        setStudentNote("");
        setSelectedPurchase(null);
        refetch();
      },
      onError: (err: any) => {
        console.error("Failed to submit redemption request:", err.message);
      },
    }
  );

  const handleRequestRedemption = (purchaseId: string) => {
    setSelectedPurchase(purchaseId);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedPurchase) return;
    createRedemption({
      variables: {
        purchaseId: selectedPurchase,
        studentNote: studentNote.trim() || undefined,
      },
    });
  };

  if (!currentClassId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Package className="mx-auto h-8 w-8 mb-2" />
        <p className="text-sm">Select a class to view your backpack</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p className="text-sm">Failed to load backpack</p>
      </div>
    );
  }

  const backpackItems = (data as any)?.studentBackpack || [];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5" />
        <h2 className="text-lg font-semibold">My Backpack</h2>
        <Badge variant="secondary">{backpackItems.length}</Badge>
      </div>

      {backpackItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Your backpack is empty</p>
            <p className="text-xs mt-1">Purchase items from the store!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {backpackItems.map((purchase: any) => (
            <Card key={purchase.id}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">
                  {purchase.storeItem?.title || "(Deleted Item)"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {purchase.storeItem?.imageUrl ? (
                  <img
                    src={purchase.storeItem.imageUrl}
                    alt={purchase.storeItem.title}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center mb-2">
                    <Package className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {purchase.storeItem?.description || "Item no longer available"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium">
                    {purchase.quantity}x ${purchase.unitPrice} = ${purchase.total}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {purchase.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleRequestRedemption(purchase.id)}
                >
                  Request Redemption
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Redemption</DialogTitle>
            <DialogDescription>
              Submit a redemption request to your teacher. You can optionally add a note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any details for your teacher..."
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
