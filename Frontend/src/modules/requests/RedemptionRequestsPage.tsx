import { useQuery, useMutation } from "@apollo/client/react";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import { REDEMPTION_REQUESTS } from "@/graphql/queries/backpack";
import { APPROVE_REDEMPTION, DENY_REDEMPTION } from "@/graphql/mutations/redemption";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";

type RedemptionAction = {
  requestId: string;
  type: "approve" | "deny";
};

export function RedemptionRequestsPage() {
  const { currentClassId } = useCurrentClass();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [actionDialog, setActionDialog] = useState<RedemptionAction | null>(null);
  const [teacherComment, setTeacherComment] = useState("");

  // Fetch all requests for accurate counts
  const { data: allData } = useQuery(REDEMPTION_REQUESTS, {
    variables: {
      classId: currentClassId,
      status: undefined, // Get all statuses
    },
    skip: !currentClassId,
    fetchPolicy: "cache-and-network",
  });

  // Fetch filtered requests for current tab
  const { data, loading, error, refetch } = useQuery(REDEMPTION_REQUESTS, {
    variables: {
      classId: currentClassId,
      status: activeTab === "all" ? undefined : activeTab.toUpperCase(),
    },
    skip: !currentClassId,
    fetchPolicy: "cache-and-network",
  });

  const [approveRedemption, { loading: approving }] = useMutation(APPROVE_REDEMPTION, {
    refetchQueries: ["RedemptionRequests", "StudentBackpack"],
    onCompleted: () => {
      console.log("Redemption approved successfully!");
      closeDialog();
      refetch();
    },
    onError: (err: any) => {
      console.error("Failed to approve redemption:", err.message);
    },
  });

  const [denyRedemption, { loading: denying }] = useMutation(DENY_REDEMPTION, {
    refetchQueries: ["RedemptionRequests", "StudentBackpack"],
    onCompleted: () => {
      console.log("Redemption denied successfully!");
      closeDialog();
      refetch();
    },
    onError: (err: any) => {
      console.error("Failed to deny redemption:", err.message);
    },
  });

  const closeDialog = () => {
    setActionDialog(null);
    setTeacherComment("");
  };

  const handleAction = () => {
    if (!actionDialog || !teacherComment.trim()) return;

    const mutation = actionDialog.type === "approve" ? approveRedemption : denyRedemption;
    mutation({
      variables: {
        id: actionDialog.requestId,
        teacherComment: teacherComment.trim(),
      },
    });
  };

  if (!currentClassId) {
    return (
      <div className="p-8 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Class Selected</h2>
        <p className="text-muted-foreground">
          Please select a class to view redemption requests
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Failed to load redemption requests</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  const requests = (data as any)?.redemptionRequests || [];
  const allRequests = (allData as any)?.redemptionRequests || [];
  
  // Calculate counts from all requests, not just filtered ones
  const pendingCount = allRequests.filter((r: any) => r.status === "PENDING").length;
  const approvedCount = allRequests.filter((r: any) => r.status === "APPROVED").length;
  const deniedCount = allRequests.filter((r: any) => r.status === "DENIED").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "DENIED":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "APPROVED":
        return "default";
      case "DENIED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Redemption Requests</h1>
        <p className="text-muted-foreground">
          Review and manage student redemption requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2" variant="secondary">{pendingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <Badge className="ml-2" variant="outline">{approvedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="denied">
            Denied <Badge className="ml-2" variant="outline">{deniedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No {activeTab !== "all" ? activeTab : ""} redemption requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((request: any) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {request.purchase?.storeItem?.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {request.student?.name}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">
                          Item ID: {request.purchase?.itemId || 'N/A'}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {request.purchase?.storeItem?.imageUrl && (
                      <img
                        src={request.purchase.storeItem.imageUrl}
                        alt={request.purchase.storeItem.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Item Details</p>
                      <p className="text-sm">
                        {request.purchase?.quantity}x @ ${request.purchase?.unitPrice} = ${request.purchase?.total}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Purchased: {new Date(request.purchase?.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {request.studentNote && (
                      <div>
                        <p className="text-sm font-medium mb-1">Student Note</p>
                        <p className="text-sm text-muted-foreground">{request.studentNote}</p>
                      </div>
                    )}

                    {request.teacherComment && (
                      <div>
                        <p className="text-sm font-medium mb-1">Teacher Comment</p>
                        <p className="text-sm text-muted-foreground">{request.teacherComment}</p>
                        {request.reviewedBy && (
                          <p className="text-xs text-muted-foreground mt-1">
                            By {request.reviewedBy.name} on{" "}
                            {new Date(request.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === "PENDING" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            setActionDialog({ requestId: request.id, type: "approve" })
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            setActionDialog({ requestId: request.id, type: "deny" })
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!actionDialog} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === "approve" ? "Approve" : "Deny"} Redemption
            </DialogTitle>
            <DialogDescription>
              Add a comment explaining your decision. This will be visible to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment *</Label>
              <Textarea
                id="comment"
                placeholder="Add your comment..."
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => closeDialog()}
              disabled={approving || denying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={approving || denying || !teacherComment.trim()}
              variant={actionDialog?.type === "deny" ? "destructive" : "default"}
            >
              {(approving || denying) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {actionDialog?.type === "approve" ? "Approving..." : "Denying..."}
                </>
              ) : (
                <>
                  {actionDialog?.type === "approve" ? "Approve" : "Deny"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
