import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { IssueFineDialog } from "@/components/fines/IssueFineDialog";
import { FINES_BY_CLASS } from "@/graphql/queries/fines";
import { WAIVE_FINE } from "@/graphql/mutations/fines";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";

export function FinesManagementPage() {
  const { classId } = useParams<{ classId: string }>();
  const { push: toast } = useToast();
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );

  const { data, loading, error, refetch } = useQuery(FINES_BY_CLASS, {
    variables: { classId, status: selectedStatus },
    skip: !classId,
  });

  const [waiveFine] = useMutation(WAIVE_FINE, {
    onCompleted: () => {
      toast({ title: "Fine waived successfully" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleWaiveFine = async (fineId: string) => {
    const reason = prompt("Please provide a reason for waiving this fine:");
    if (!reason || !reason.trim()) {
      toast({
        title: "Reason required",
        description: "You must provide a reason to waive a fine.",
        variant: "destructive",
      });
      return;
    }

    await waiveFine({
      variables: {
        id: fineId,
        reason: reason.trim(),
      },
    });
  };

  const fines = (data as any)?.finesByClass || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLIED":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Applied
          </Badge>
        );
      case "WAIVED":
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Waived
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading fines...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading fines: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fines Management</h1>
          <p className="text-muted-foreground">
            Issue and manage student fines for your class
          </p>
        </div>
        <Button onClick={() => setShowIssueDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Issue Fine
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Fines</CardTitle>
          <CardDescription>
            View and manage fines issued to students
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant={selectedStatus === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(undefined)}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === "APPLIED" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("APPLIED")}
            >
              Applied
            </Button>
            <Button
              variant={selectedStatus === "WAIVED" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("WAIVED")}
            >
              Waived
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fines.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No fines issued</h3>
              <p className="text-muted-foreground">
                No fines have been issued to students yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.map((fine: any) => (
                    <TableRow key={fine.id}>
                      <TableCell className="font-medium">
                        {fine.student?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-destructive font-semibold">
                          -CE$ {fine.amount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{fine.reason}</div>
                          {fine.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {fine.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(fine.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {fine.teacher?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(fine.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(fine.createdAt), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {fine.status === "APPLIED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWaiveFine(fine.id)}
                          >
                            Waive
                          </Button>
                        )}
                        {fine.status === "WAIVED" && fine.waivedReason && (
                          <div className="text-xs text-muted-foreground">
                            Waived: {fine.waivedReason}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {classId && (
        <IssueFineDialog
          open={showIssueDialog}
          onOpenChange={setShowIssueDialog}
          classId={classId}
        />
      )}
    </div>
  );
}
