import { useQuery } from "@apollo/client/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, DollarSign, CheckCircle2 } from "lucide-react";
import { FINES_BY_STUDENT } from "@/graphql/queries/fines";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StudentFinesListProps {
  studentId: string;
  classId: string;
}

export function StudentFinesList({ studentId, classId }: StudentFinesListProps) {
  const { data, loading, error } = useQuery(FINES_BY_STUDENT, {
    variables: { studentId, classId },
  });

  const fines = (data as any)?.finesByStudent || [];
  const appliedFines = fines.filter((f: any) => f.status === "APPLIED");
  const totalFinesAmount = appliedFines.reduce(
    (sum: number, f: any) => sum + f.amount,
    0
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLIED":
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="mr-1 h-3 w-3" />
            Applied
          </Badge>
        );
      case "WAIVED":
        return (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Waived
          </Badge>
        );
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Fines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading fines...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Fines</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Fines</span>
          {appliedFines.length > 0 && (
            <Badge variant="destructive" className="text-sm">
              -{totalFinesAmount} CE$
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Fines issued by your teacher that affect your balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fines.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold">No fines!</h3>
            <p className="text-muted-foreground">
              You haven't received any fines. Keep up the good work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appliedFines.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Active Fines</AlertTitle>
                <AlertDescription>
                  You have {appliedFines.length} active fine
                  {appliedFines.length !== 1 ? "s" : ""} totaling CE${" "}
                  {totalFinesAmount}. These amounts have been deducted from your
                  balance.
                </AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.map((fine: any) => (
                    <TableRow key={fine.id}>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(fine.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(fine.createdAt), "h:mm a")}
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
                          {fine.status === "WAIVED" && fine.waivedReason && (
                            <div className="text-sm text-green-600 mt-1">
                              Waived: {fine.waivedReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center font-semibold ${
                            fine.status === "APPLIED"
                              ? "text-destructive"
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          {fine.amount}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(fine.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {fine.teacher?.name || "Teacher"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
