import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@apollo/client/react";
import { GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import { ClassesByUserQuery } from "@/graphql/__generated__/graphql";
import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { 
  DollarSign, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const { push } = useToast();
  const user = useAppSelector(selectUser);

  // Fetch all teacher's classes
  const { data: classesData, loading, error } = useQuery<ClassesByUserQuery>(GET_CLASSES_BY_USER, {
    variables: { 
      userId: user?.id || "",
      role: "TEACHER",
      includeArchived: false 
    },
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });

  React.useEffect(() => {
    if (error) {
      push({
        title: "Failed to load classes",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, push]);

  const classes = classesData?.classesByUser || [];
  const totalClasses = classes.length;

  // Calculate aggregated statistics (these would ideally come from dedicated GraphQL queries)
  // For now, we'll show what we can from the basic class data
  const activeClasses = classes.filter((cls: any) => !cls.isArchived).length;
  const archivedClasses = classes.filter((cls: any) => cls.isArchived).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of all your classroom economies
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : totalClasses}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeClasses} active, {archivedClasses} archived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : activeClasses}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running economies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : "Ready"}
            </div>
            <p className="text-xs text-muted-foreground">
              Manage all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "Loading..." : "Operational"}
            </div>
            <p className="text-xs text-muted-foreground">
              All systems running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Classes</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                No Classes Yet
              </CardTitle>
              <CardDescription>
                Create your first classroom economy to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Create First Class
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls: any) => (
              <Card key={cls.id} className={cn("cursor-pointer hover:shadow-md transition-shadow", cls.isArchived && "opacity-60")}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{cls.name}</span>
                    {cls.isArchived && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Archived</span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {cls.subject && cls.period 
                      ? `${cls.subject} • Period ${cls.period}`
                      : cls.subject || "Classroom Economy"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{cls.defaultCurrency || "CE$"}</span>
                  </div>
                  {!cls.isArchived && (
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors">
                        Manage
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common teacher tasks across all classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-left">
              Create New Class
            </button>
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-left">
              Review All Pending Requests
            </button>
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-left">
              Generate Reports
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates across your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Activity feed would show recent transactions, requests, and student actions across all classes.
            </div>
            <div className="mt-3">
              <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80 transition-colors">
                View All Activity
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
