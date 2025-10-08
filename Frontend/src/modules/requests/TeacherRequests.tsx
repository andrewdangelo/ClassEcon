import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { PAY_REQUESTS_BY_CLASS } from "@/graphql/queries/requests";
import { PayRequestsByClassQuery } from "@/graphql/__generated__/graphql";
import {
  APPROVE_PAY_REQUEST,
  SUBMIT_PAY_REQUEST,
  REBUKE_PAY_REQUEST,
  DENY_PAY_REQUEST,
  ADD_PAY_REQUEST_COMMENT,
} from "@/graphql/mutations/payRequests";
import { PAY_REQUEST_CREATED, PAY_REQUEST_STATUS_CHANGED } from "@/graphql/subscriptions/payRequests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Status =
  | "SUBMITTED"
  | "APPROVED"
  | "PAID"
  | "REBUKED"
  | "DENIED"
  | undefined;

export default function TeacherRequests({ classId }: { classId: string }) {
  const { push: toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<Status>(undefined);
  const [approvalAmounts, setApprovalAmounts] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [actionComments, setActionComments] = useState<{ [key: string]: string }>({});

  const { data, loading, error, refetch } = useQuery<PayRequestsByClassQuery>(PAY_REQUESTS_BY_CLASS, {
    variables: { classId, status: filterStatus },
    fetchPolicy: "cache-and-network",
  });

  // Subscribe to new requests and status changes
  useSubscription(PAY_REQUEST_CREATED, {
    variables: { classId },
    onData: () => {
      refetch();
      toast({ title: "New payment request received" });
    },
  });

  useSubscription(PAY_REQUEST_STATUS_CHANGED, {
    variables: { classId },
    onData: () => {
      refetch();
    },
  });

  const [approve] = useMutation(APPROVE_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Approved" });
      setApprovalAmounts({});
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });

  const [submit] = useMutation(SUBMIT_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Paid" });
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });

  const [rebuke] = useMutation(REBUKE_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Rebuked" });
      setActionComments({});
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });

  const [deny] = useMutation(DENY_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Denied" });
      setActionComments({});
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });

  const [addComment] = useMutation(ADD_PAY_REQUEST_COMMENT, {
    onCompleted: () => {
      toast({ title: "Comment added" });
      setNewComments({});
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleApprove = (requestId: string, originalAmount: number) => {
    const amount = parseInt(approvalAmounts[requestId]) || originalAmount;
    const comment = actionComments[requestId];
    approve({
      variables: { 
        id: requestId, 
        amount,
        comment: comment || null 
      },
    });
  };

  const handleRebuke = (requestId: string) => {
    const comment = actionComments[requestId]?.trim();
    if (!comment) {
      toast({ title: "Comment required for rebuke", variant: "destructive" });
      return;
    }
    rebuke({ variables: { id: requestId, comment } });
  };

  const handleDeny = (requestId: string) => {
    const comment = actionComments[requestId]?.trim();
    if (!comment) {
      toast({ title: "Comment required for denial", variant: "destructive" });
      return;
    }
    deny({ variables: { id: requestId, comment } });
  };

  const handleAddComment = (payRequestId: string) => {
    const commentText = newComments[payRequestId]?.trim();
    if (!commentText) return;

    addComment({
      variables: {
        payRequestId,
        content: commentText,
      },
    });
  };

  const toggleComments = (requestId: string) => {
    setShowComments(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  if (loading)
    return (
      <div className="text-sm text-muted-foreground">Loading requests…</div>
    );
  if (error)
    return (
      <div className="text-sm text-destructive">Error: {error.message}</div>
    );

  const rows = data?.payRequestsByClass ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Class requests</CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus || "ALL"}
            onValueChange={(v) => setFilterStatus(v === "ALL" ? undefined : (v as Status))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REBUKED">Rebuked</SelectItem>
              <SelectItem value="DENIED">Denied</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No requests.
            </div>
          ) : (
            rows.map((request: any) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-4">
                {/* Request Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {request.student?.name} • {request.reason}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Requested: ${request.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.justification}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                    {request.teacherComment && (
                      <div className="text-sm mt-2 p-2 bg-muted rounded">
                        <strong>Teacher comment:</strong> {request.teacherComment}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">{request.status}</Badge>
                </div>

                {/* Action Controls */}
                <div className="space-y-3">
                  {request.status === "SUBMITTED" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Approve amount:</span>
                      <Input
                        type="number"
                        placeholder={`${request.amount}`}
                        value={approvalAmounts[request.id] || ''}
                        onChange={(e) => setApprovalAmounts(prev => ({
                          ...prev,
                          [request.id]: e.target.value
                        }))}
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id, request.amount)}
                      >
                        Approve
                      </Button>
                    </div>
                  )}

                  {/* Teacher Action Comment Input */}
                  {request.status !== "PAID" && request.status !== "DENIED" && (
                    <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm font-medium">Teacher Response:</div>
                      <Textarea
                        placeholder="Add a comment (required for rebuke/deny, optional for approve)..."
                        value={actionComments[request.id] || ''}
                        onChange={(e) => setActionComments(prev => ({
                          ...prev,
                          [request.id]: e.target.value
                        }))}
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {request.status === "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => submit({ variables: { id: request.id } })}
                      >
                        Mark as Paid
                      </Button>
                    )}
                    
                    {request.status !== "PAID" && request.status !== "DENIED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRebuke(request.id)}
                        >
                          Rebuke (requires comment)
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeny(request.id)}
                        >
                          Deny (requires comment)
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleComments(request.id)}
                  >
                    {showComments[request.id] ? 'Hide' : 'Show'} Comments ({request.comments?.length || 0})
                  </Button>

                  {showComments[request.id] && (
                    <div className="space-y-3 pl-4 border-l-2 border-muted">
                      {/* Existing Comments */}
                      {request.comments?.map((comment: any) => (
                        <div key={comment.id} className="space-y-1">
                          <div className="text-sm">
                            <strong>{comment.user.name}:</strong> {comment.content}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComments[request.id] || ''}
                          onChange={(e) => setNewComments(prev => ({
                            ...prev,
                            [request.id]: e.target.value
                          }))}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(request.id)}
                          disabled={!newComments[request.id]?.trim()}
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
