import { useQuery } from "@apollo/client/react";
import { PAY_REQUESTS_BY_STUDENT } from "@/graphql/queries/requests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentRequestsList({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  const { data, loading, error, refetch } = useQuery(PAY_REQUESTS_BY_STUDENT, {
    variables: { classId, studentId },
  });

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
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No requests yet.</div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r: any) => (
              <li
                key={r.id}
                className="flex items-start justify-between border rounded-md p-3"
              >
                <div>
                  <div className="font-medium">
                    {r.reason} • ${r.amount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                  {r.teacherComment && (
                    <div className="text-xs mt-1">
                      Teacher: {r.teacherComment}
                    </div>
                  )}
                </div>
                <Badge variant="outline">{r.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
