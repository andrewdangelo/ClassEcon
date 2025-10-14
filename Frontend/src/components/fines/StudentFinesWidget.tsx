import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@apollo/client/react";
import { FINES_BY_STUDENT } from "@/graphql/queries/fines";
import { AlertTriangle, DollarSign, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as React from "react";

interface StudentFinesWidgetProps {
  studentId: string;
  classId: string;
  defaultCurrency?: string;
}

export default function StudentFinesWidget({ 
  studentId, 
  classId,
  defaultCurrency = "CE$"
}: StudentFinesWidgetProps) {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(FINES_BY_STUDENT, {
    variables: { studentId, classId },
    skip: !studentId || !classId,
    fetchPolicy: "cache-and-network",
  });

  if (!studentId || !classId) {
    return null;
  }

  const fines = (data as any)?.finesByStudent || [];
  const activeFines = fines.filter((f: any) => f.status === "APPLIED");
  const waivedFines = fines.filter((f: any) => f.status === "WAIVED");
  const recentFines = fines.slice(0, 3); // Show 3 most recent

  // Calculate total active fine amount
  const totalActiveFineAmount = activeFines.reduce(
    (sum: number, fine: any) => sum + fine.amount,
    0
  );

  const handleViewDetails = () => {
    // Navigate to backpack or profile page where StudentFinesList is displayed
    navigate(`/profile`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          My Fines
        </CardTitle>
        <CardDescription>Your current and past fines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">Failed to load fines data</div>
        ) : (
          <>
            {/* Active Fines Alert */}
            {activeFines.length > 0 && (
              <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">
                    You have {activeFines.length} active fine{activeFines.length !== 1 ? "s" : ""}
                  </span>
                  <div className="mt-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-lg font-bold">
                      {defaultCurrency} {totalActiveFineAmount.toFixed(2)}
                    </span>
                    <span className="text-sm">total deducted</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Active Fines</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{activeFines.length}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>Total Fined</span>
                </div>
                <div className="text-2xl font-bold">${totalActiveFineAmount}</div>
              </div>
            </div>

            {/* Recent Fines List */}
            {recentFines.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Recent Fines</div>
                <div className="space-y-2">
                  {recentFines.map((fine: any) => (
                    <div
                      key={fine.id}
                      className="flex items-start justify-between text-sm p-3 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={fine.status === "APPLIED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {fine.status === "APPLIED" ? "Active" : "Waived"}
                          </Badge>
                          <span className="font-semibold text-yellow-600">
                            ${fine.amount}
                          </span>
                        </div>
                        <div className="text-xs font-medium mb-1">{fine.reason}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(fine.createdAt), "MMM d, h:mm a")}
                        </div>
                        {fine.status === "WAIVED" && fine.waiveReason && (
                          <div className="text-xs text-green-600 mt-1">
                            Waived: {fine.waiveReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">No fines yet</p>
                <p className="text-xs mt-1">Keep up the good work!</p>
              </div>
            )}

            {/* View Details Button */}
            {fines.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleViewDetails} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View All {fines.length} Fine{fines.length !== 1 ? "s" : ""}
              </Button>
            )}

            {/* Summary Stats */}
            {waivedFines.length > 0 && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {waivedFines.length} fine{waivedFines.length !== 1 ? "s" : ""} waived
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
