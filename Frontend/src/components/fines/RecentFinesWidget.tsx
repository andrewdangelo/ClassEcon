import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@apollo/client/react";
import { FINES_BY_CLASS } from "@/graphql/queries/fines";
import { AlertTriangle, DollarSign, Users, Clock, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as React from "react";

interface RecentFinesWidgetProps {
  classId: string;
  onIssueFineBtnClick?: () => void;
}

export default function RecentFinesWidget({ classId, onIssueFineBtnClick }: RecentFinesWidgetProps) {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(FINES_BY_CLASS, {
    variables: { classId },
    skip: !classId,
    fetchPolicy: "cache-and-network",
  });

  if (!classId) {
    return null;
  }

  const fines = (data as any)?.finesByClass || [];
  const activeFines = fines.filter((f: any) => f.status === "APPLIED");
  const recentFines = fines.slice(0, 5); // Show 5 most recent

  // Calculate statistics
  const totalFinesIssued = fines.length;
  const totalAmount = fines
    .filter((f: any) => f.status === "APPLIED")
    .reduce((sum: number, f: any) => sum + f.amount, 0);
  const uniqueStudents = new Set(fines.map((f: any) => f.studentId)).size;

  const handleViewAll = () => {
    navigate(`/classes/${classId}/fines`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Fines Overview
            </CardTitle>
            <CardDescription>Recent fines and statistics</CardDescription>
          </div>
          {onIssueFineBtnClick && (
            <Button size="sm" onClick={onIssueFineBtnClick} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Issue Fine
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">Failed to load fines data</div>
        ) : (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Active Fines</span>
                </div>
                <div className="text-2xl font-bold">{activeFines.length}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>Total Amount</span>
                </div>
                <div className="text-2xl font-bold">${totalAmount}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Students</span>
                </div>
                <div className="text-2xl font-bold">{uniqueStudents}</div>
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
                      className="flex items-center justify-between text-sm border-l-2 pl-3 py-2 rounded-r"
                      style={{
                        borderColor: fine.status === "APPLIED" ? "#f59e0b" : "#10b981",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {fine.student?.firstName} {fine.student?.lastName}
                          </span>
                          <Badge
                            variant={fine.status === "APPLIED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {fine.status === "APPLIED" ? "Active" : "Waived"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{fine.reason}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(fine.createdAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                      <div className="font-semibold text-yellow-600 ml-2">${fine.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">No fines issued yet</p>
                <p className="text-xs mt-1">Click "Issue Fine" to get started</p>
              </div>
            )}

            {/* View All Button */}
            {fines.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleViewAll} className="w-full">
                View All {totalFinesIssued} Fines
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
