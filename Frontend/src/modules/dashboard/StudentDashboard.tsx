import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import { useQuery } from "@apollo/client/react";
import { STUDENTS_BY_CLASS } from "@/graphql/queries/students";
import { PAY_REQUESTS_BY_STUDENT } from "@/graphql/queries/requests";
import { STORE_ITEMS_BY_CLASS } from "@/graphql/queries/store";
import { StudentsByClassQuery, PayRequestsByStudentQuery, StoreItemsByClassQuery } from "@/graphql/__generated__/graphql";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import StudentActivityWidget from "@/components/activity/StudentActivityWidget";
import BalanceOverTimeChart from "@/components/activity/BalanceOverTimeChart";

export default function StudentDashboard() {
  const { currentClassId, current } = useCurrentClass();
  const { push } = useToast();
  const user = useAppSelector(selectUser);

  // Fetch student's data in current class
  const { data: studentsData, loading: studentsLoading, error: studentsError } = useQuery<StudentsByClassQuery>(STUDENTS_BY_CLASS, {
    variables: { classId: currentClassId },
    skip: !currentClassId,
    fetchPolicy: "cache-and-network",
  });

  // Fetch student's pay requests
  const { data: requestsData, loading: requestsLoading } = useQuery<PayRequestsByStudentQuery>(PAY_REQUESTS_BY_STUDENT, {
    variables: { 
      classId: currentClassId,
      studentId: user?.id || ""
    },
    skip: !currentClassId || !user?.id,
    fetchPolicy: "cache-and-network",
  });

  // Fetch store items to show available purchases
  const { data: storeData, loading: storeLoading } = useQuery<StoreItemsByClassQuery>(STORE_ITEMS_BY_CLASS, {
    variables: { classId: currentClassId },
    skip: !currentClassId,
    fetchPolicy: "cache-and-network",
  });

  React.useEffect(() => {
    if (studentsError) {
      push({
        title: "Failed to load class data",
        description: studentsError.message,
        variant: "destructive",
      });
    }
  }, [studentsError, push]);

  if (!currentClassId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Join a class to start participating in the classroom economy.
          </p>
        </div>
      </div>
    );
  }

  // Find current student's data
  const students = studentsData?.studentsByClass || [];
  const currentStudent = students.find((s: any) => s.id === user?.id);
  const myBalance = currentStudent?.balance || 0;

  // Get requests data
  const myRequests = requestsData?.payRequestsByStudent || [];
  const pendingRequests = myRequests.filter((req: any) => req.status === "PENDING");
  const approvedRequests = myRequests.filter((req: any) => req.status === "APPROVED");

  // Store data
  const storeItems = storeData?.storeItemsByClass || [];
  const affordableItems = storeItems.filter((item: any) => item.active && item.price <= myBalance);
  
  // Calculate student ranking
  const sortedStudents = [...students].sort((a: any, b: any) => (b.balance || 0) - (a.balance || 0));
  const myRank = sortedStudents.findIndex((s: any) => s.id === user?.id) + 1;
  const totalStudents = students.length;

  const loading = studentsLoading || requestsLoading || storeLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            {current?.name || "Your classroom economy progress"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Balance Over Time Chart */}
      {user?.id && currentClassId && (
        <BalanceOverTimeChart 
          studentId={user.id}
          classId={currentClassId}
          currentBalance={myBalance}
          defaultCurrency={current?.defaultCurrency || "CE$"}
        />
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : `${current?.defaultCurrency || "CE$"} ${myBalance.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : `#${myRank}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className={cn(
              "h-4 w-4",
              pendingRequests.length > 0 ? "text-orange-500" : "text-muted-foreground"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : pendingRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affordable Items</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : affordableItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items I can buy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats & Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest approved requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : approvedRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved requests yet. Start earning by completing tasks!
              </p>
            ) : (
              <div className="space-y-3">
                {approvedRequests.slice(0, 3).map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{req.reason}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-medium text-green-600">
                      +{current?.defaultCurrency || "CE$"} {req.amount}
                    </div>
                  </div>
                ))}
                {approvedRequests.length > 3 && (
                  <button className="text-xs text-primary hover:underline">
                    View all {approvedRequests.length} requests
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Goals & Progress
            </CardTitle>
            <CardDescription>
              Your classroom economy journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress to Top 10</span>
                <span>{myRank <= 10 ? "Achieved!" : `Rank ${myRank}`}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    myRank <= 10 ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ 
                    width: myRank <= 10 ? "100%" : `${Math.max(10, (totalStudents - myRank) / totalStudents * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Spending Power</span>
                <span>{affordableItems.length} / {storeItems.length} items</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: storeItems.length > 0 ? `${(affordableItems.length / storeItems.length) * 100}%` : "0%" 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Widget */}
      {user?.id && currentClassId && (
        <StudentActivityWidget 
          studentId={user.id}
          classId={currentClassId}
          defaultCurrency={current?.defaultCurrency || "CE$"}
        />
      )}
    </div>
  );
}
