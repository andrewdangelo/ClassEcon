import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { PAY_REQUESTS_BY_STUDENT } from "@/graphql/queries/requests";
import { ADD_PAY_REQUEST_COMMENT } from "@/graphql/mutations/payRequests";
import { PAY_REQUEST_STATUS_CHANGED, PAY_REQUEST_COMMENT_ADDED } from "@/graphql/subscriptions/payRequests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function StudentRequestsList({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  const { push: toast } = useToast();
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  const { data, loading, error, refetch } = useQuery(PAY_REQUESTS_BY_STUDENT, {
    variables: { classId, studentId },
  });

  // Subscribe to status changes for this class
  useSubscription(PAY_REQUEST_STATUS_CHANGED, {
    variables: { classId },
    onData: ({ data: subData }) => {
      if (subData?.data?.payRequestStatusChanged) {
        refetch();
        toast({ title: "Request status updated" });
      }
    },
  });

  const [addComment, { loading: commentLoading }] = useMutation(ADD_PAY_REQUEST_COMMENT, {
    onCompleted: () => {
      toast({ title: "Comment added" });
      setCommentText({});
      refetch();
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const handleAddComment = (payRequestId: string) => {
    const comment = commentText[payRequestId]?.trim();
    if (!comment) return;

    addComment({
      variables: {
        payRequestId,
        content: comment,
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

  const rows = data?.payRequestsByStudent ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No requests yet.</div>
        ) : (
          <div className="space-y-4">
            {rows.map((request: any) => (
              <div
                key={request.id}
                className="border rounded-md p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {request.reason} • ${request.amount}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {request.justification}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                    {request.teacherComment && (
                      <div className="text-sm mt-2 p-2 bg-muted rounded">
                        <strong>Teacher:</strong> {request.teacherComment}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">{request.status}</Badge>
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
                    <div className="space-y-3 pl-4">
                      {/* Existing Comments */}
                      {request.comments?.map((comment: any) => (
                        <div key={comment.id} className="border-l-2 border-muted pl-3">
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
                          value={commentText[request.id] || ''}
                          onChange={(e) => setCommentText(prev => ({
                            ...prev,
                            [request.id]: e.target.value
                          }))}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(request.id)}
                          disabled={commentLoading || !commentText[request.id]?.trim()}
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
