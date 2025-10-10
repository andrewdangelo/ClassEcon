import { useQuery, useMutation } from "@apollo/client/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Gift, Calendar, DollarSign, History, AlertCircle } from "lucide-react";
import { STUDENT_BACKPACK, REDEMPTION_HISTORY } from "@/graphql/queries/backpack";
import { CREATE_REDEMPTION_REQUEST } from "@/graphql/mutations/redemption";
import { useClassContext } from "@/context/ClassContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { ME } from "@/graphql/queries/me";
import { MeQuery, StudentBackpackQuery } from "@/graphql/__generated__/graphql";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BackpackPage() {
  const { currentClassId } = useClassContext();
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Get current user ID
  const { data: meData } = useQuery<MeQuery>(ME);
  const userId = meData?.me?.id;

  const { data, loading, error, refetch } = useQuery<StudentBackpackQuery>(STUDENT_BACKPACK, {
    variables: { 
      studentId: userId!,
      classId: currentClassId! 
    },
    skip: !currentClassId || !userId,
  });

  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useQuery(REDEMPTION_HISTORY, {
    variables: {
      studentId: userId!,
      classId: currentClassId!
    },
    skip: !currentClassId || !userId,
  });

  const [createRedemptionRequest, { loading: submitting, error: submitError }] = useMutation(CREATE_REDEMPTION_REQUEST, {
    onCompleted: () => {
      setSelectedPurchase(null);
      setNote("");
      refetch();
      refetchHistory();
    },
  });

  const handleRequestRedemption = async () => {
    if (!selectedPurchase || !note.trim()) return;
    
    await createRedemptionRequest({
      variables: {
        purchaseId: selectedPurchase.id,
        studentNote: note.trim(),
      },
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Package className="h-8 w-8 animate-pulse text-muted-foreground" />
          <span className="ml-2">Loading your backpack...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading backpack: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const purchases = data?.studentBackpack || [];
  const redemptionHistory = (historyData as any)?.redemptionHistory || [];

  // Group purchases by storeItemId to show unique items with quantities
  const groupedPurchases = purchases.reduce((acc: any, purchase: any) => {
    const key = purchase.storeItemId;
    if (!acc[key]) {
      acc[key] = {
        storeItem: purchase.storeItem,
        storeItemId: purchase.storeItemId,
        allItems: [], // All items for this storeItem
        availableItems: [], // Items without pending redemption
        totalQuantity: 0,
        totalValue: 0,
        availableCount: 0,
      };
    }
    acc[key].allItems.push(purchase);
    acc[key].totalQuantity += purchase.quantity;
    acc[key].totalValue += purchase.total;
    
    // Track available items (without pending redemption)
    if (!purchase.hasPendingRedemption) {
      acc[key].availableItems.push(purchase);
      acc[key].availableCount++;
    }
    
    return acc;
  }, {});

  const uniqueItems = Object.values(groupedPurchases);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          My Backpack
        </h1>
        <p className="text-muted-foreground mt-2">
          View and redeem your purchased items
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            <Package className="h-4 w-4 mr-2" />
            Active Items
            {uniqueItems.length > 0 && (
              <Badge className="ml-2" variant="secondary">{uniqueItems.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Redemption History
            {redemptionHistory.length > 0 && (
              <Badge className="ml-2" variant="outline">{redemptionHistory.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {uniqueItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Your backpack is empty</p>
            <p className="text-sm text-muted-foreground">
              Purchase items from the store to add them here
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/store"}>
              Visit Store
            </Button>
          </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {uniqueItems.map((group: any) => {
            const storeItem = group.storeItem;
            const hasAvailable = group.availableCount > 0;
            const hasPending = group.allItems.length > group.availableCount;

            return (
              <Card key={group.storeItemId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  {storeItem?.imageUrl ? (
                    <img
                      src={storeItem.imageUrl}
                      alt={storeItem.title || "(Deleted Item)"}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted rounded-md mb-2 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {storeItem?.title || "(Deleted Item)"}
                    </CardTitle>
                    {hasPending && (
                      <Badge variant="secondary" className="ml-2">
                        Pending
                      </Badge>
                    )}
                  </div>
                  {storeItem?.description && (
                    <CardDescription className="line-clamp-2">
                      {storeItem.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Total Owned:
                    </span>
                    <span className="font-medium">{group.totalQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Total Value:
                    </span>
                    <span className="font-medium">${group.totalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift className="h-4 w-4" />
                      Available to Redeem:
                    </span>
                    <span className={hasAvailable ? "font-medium text-green-600" : "text-muted-foreground"}>
                      {group.availableCount}
                    </span>
                  </div>
                  
                  {hasPending && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      {group.allItems.length - group.availableCount} redemption {group.allItems.length - group.availableCount === 1 ? 'request' : 'requests'} pending
                    </p>
                  )}

                  <Button
                    onClick={() => {
                      // Select the first available item for redemption
                      const firstAvailableItem = group.availableItems[0];
                      setSelectedPurchase(firstAvailableItem);
                    }}
                    disabled={!storeItem || !hasAvailable}
                    className="w-full"
                    variant={hasAvailable ? "default" : "outline"}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    {hasAvailable ? "Request Redemption" : "All Items Pending"}
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Package className="h-8 w-8 animate-pulse text-muted-foreground" />
              <span className="ml-2">Loading history...</span>
            </div>
          ) : redemptionHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <History className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No redemption history</p>
                <p className="text-sm text-muted-foreground">
                  Your redemption requests will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {redemptionHistory.map((request: any) => {
                const purchase = request.purchase;
                const storeItem = purchase?.storeItem;
                
                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {storeItem?.title || "(Deleted Item)"}
                            <Badge
                              variant={
                                request.status === "APPROVED" ? "default" :
                                request.status === "DENIED" ? "destructive" :
                                "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Item ID: {purchase?.itemId || 'N/A'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {storeItem?.imageUrl && (
                        <img
                          src={storeItem.imageUrl}
                          alt={storeItem.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span>${purchase?.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requested:</span>
                          <span>{new Date(request.createdAt).toLocaleString()}</span>
                        </div>
                        {request.reviewedAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {request.status === "APPROVED" ? "Approved:" : "Denied:"}
                            </span>
                            <span>{new Date(request.reviewedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {request.status === "APPROVED" && purchase?.redemptionDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Redeemed:</span>
                            <span>{new Date(purchase.redemptionDate).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {request.studentNote && (
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium mb-1">Your Note:</p>
                          <p className="text-sm text-muted-foreground">{request.studentNote}</p>
                        </div>
                      )}

                      {request.teacherComment && (
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium mb-1">Teacher Response:</p>
                          <p className="text-sm text-muted-foreground">{request.teacherComment}</p>
                          {request.reviewedBy && (
                            <p className="text-xs text-muted-foreground mt-1">
                              - {request.reviewedBy.name}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPurchase} onOpenChange={() => {
        setSelectedPurchase(null);
        setNote("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Redemption</DialogTitle>
            <DialogDescription>
              Explain what you intend to use "{selectedPurchase?.storeItem?.title}" for. Your teacher will review your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You must provide a note explaining what you intend to use this item for.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="note">What will you use this for? *</Label>
              <Textarea
                id="note"
                placeholder="Example: I want to use this free homework pass on tonight's math assignment..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                {note.trim().length} / 500 characters
              </p>
            </div>
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {submitError.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedPurchase(null);
                setNote("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestRedemption} 
              disabled={submitting || !note.trim()}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
