import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { PAY_REQUESTS_BY_CLASS } from "@/graphql/queries/requests";
import {
  APPROVE_PAY_REQUEST,
  SUBMIT_PAY_REQUEST,
  REBUKE_PAY_REQUEST,
  DENY_PAY_REQUEST,
} from "@/graphql/mutations/payRequests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

type Status =
  | "SUBMITTED"
  | "APPROVED"
  | "PAID"
  | "REBUKED"
  | "DENIED"
  | undefined;

export default function TeacherRequests({ classId }: { classId: string }) {
  const [filterStatus, setFilterStatus] = useState<Status>(undefined);
  const [comment, setComment] = useState<string>("");

  const { data, loading, error, refetch } = useQuery(PAY_REQUESTS_BY_CLASS, {
    variables: { classId, status: filterStatus },
    fetchPolicy: "cache-and-network",
  });

  const [approve] = useMutation(APPROVE_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Approved" });
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
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });
  const [deny] = useMutation(DENY_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Denied" });
      refetch();
    },
    onError: (e) => toast({ title: e.message, variant: "destructive" }),
  });

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
            value={filterStatus}
            onValueChange={(v) => setFilterStatus((v || undefined) as Status)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
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
        <div className="flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional teacher comment…"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">When</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{r.student?.name ?? "—"}</td>
                  <td className="py-2 pr-4">{r.reason}</td>
                  <td className="py-2 pr-4">${r.amount}</td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline">{r.status}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        approve({
                          variables: { id: r.id, comment: comment || null },
                        })
                      }
                      disabled={r.status !== "SUBMITTED"}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submit({ variables: { id: r.id } })}
                      disabled={
                        !(r.status === "APPROVED" || r.status === "SUBMITTED")
                      }
                    >
                      Pay
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        rebuke({
                          variables: {
                            id: r.id,
                            comment: comment || "Needs more detail",
                          },
                        })
                      }
                      disabled={r.status === "PAID" || r.status === "DENIED"}
                    >
                      Rebuke
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        deny({
                          variables: { id: r.id, comment: comment || null },
                        })
                      }
                      disabled={r.status === "PAID"}
                    >
                      Deny
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
