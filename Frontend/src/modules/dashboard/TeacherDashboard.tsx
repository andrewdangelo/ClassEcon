import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@apollo/client/react";
import { GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
import { GET_CLASS_STATISTICS } from "@/graphql/queries/statistics";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import { ClassesByUserQuery } from "@/graphql/__generated__/graphql";
import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";
import { useClassContext } from "@/context/ClassContext";
import { 
  DollarSign, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Copy,
  Settings,
  ExternalLink,
  Share2,
  FileText,
  UserCheck,
  Edit3,
  Plus,
  X,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import RecentFinesWidget from "@/components/fines/RecentFinesWidget";
import { IssueFineDialog } from "@/components/fines/IssueFineDialog";

// Widget type definitions
type WidgetType = 
  | "students"
  | "jobs"
  | "employments"
  | "applications"
  | "circulation"
  | "avgBalance"
  | "payRequests"
  | "transactions"
  | "totalClasses"
  | "activeClasses"
  | "store";

interface Widget {
  id: WidgetType;
  title: string;
  icon: React.ComponentType<any>;
  route?: string;
  color: string;
  getValue: (stats: any, classes: any[]) => string | number;
  getSubtext: (stats: any, classes: any[]) => string;
}

// Available widgets
const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: "students",
    title: "Students",
    icon: Users,
    route: "/students",
    color: "text-blue-500",
    getValue: (stats) => stats?.totalStudents || 0,
    getSubtext: () => "Active members",
  },
  {
    id: "jobs",
    title: "Jobs",
    icon: Briefcase,
    route: "/jobs",
    color: "text-purple-500",
    getValue: (stats) => stats?.activeJobs || 0,
    getSubtext: (stats) => `${stats?.totalJobs || 0} total positions`,
  },
  {
    id: "employments",
    title: "Employments",
    icon: UserCheck,
    route: "/jobs",
    color: "text-green-500",
    getValue: (stats) => stats?.totalEmployments || 0,
    getSubtext: () => "Currently hired",
  },
  {
    id: "applications",
    title: "Applications",
    icon: FileText,
    route: "/jobs",
    color: "text-orange-500",
    getValue: (stats) => stats?.pendingApplications || 0,
    getSubtext: () => "Pending review",
  },
  {
    id: "circulation",
    title: "Total Circulation",
    icon: DollarSign,
    route: "/students",
    color: "text-emerald-500",
    getValue: (stats) => `$${stats?.totalCirculation || 0}`,
    getSubtext: () => "In student accounts",
  },
  {
    id: "avgBalance",
    title: "Avg Balance",
    icon: TrendingUp,
    route: "/students",
    color: "text-cyan-500",
    getValue: (stats) => `$${stats?.averageBalance || 0}`,
    getSubtext: () => "Per student",
  },
  {
    id: "payRequests",
    title: "Pay Requests",
    icon: AlertCircle,
    route: "/requests",
    color: "text-yellow-500",
    getValue: (stats) => stats?.pendingPayRequests || 0,
    getSubtext: (stats) => `${stats?.totalPayRequests || 0} total submitted`,
  },
  {
    id: "transactions",
    title: "Transactions",
    icon: CheckCircle,
    route: "/students",
    color: "text-indigo-500",
    getValue: (stats) => stats?.totalTransactions || 0,
    getSubtext: () => "Total activity",
  },
  {
    id: "totalClasses",
    title: "Your Classes",
    icon: GraduationCap,
    color: "text-slate-500",
    getValue: (_, classes) => classes?.length || 0,
    getSubtext: (_, classes) => {
      const active = classes?.filter((c: any) => !c.isArchived).length || 0;
      const archived = classes?.filter((c: any) => c.isArchived).length || 0;
      return `${active} active, ${archived} archived`;
    },
  },
  {
    id: "activeClasses",
    title: "Active Classes",
    icon: CheckCircle,
    color: "text-green-500",
    getValue: (_, classes) => classes?.filter((c: any) => !c.isArchived).length || 0,
    getSubtext: () => "Currently running",
  },
  {
    id: "store",
    title: "Store Items",
    icon: ShoppingCart,
    route: "/store",
    color: "text-pink-500",
    getValue: () => "---",
    getSubtext: () => "Manage store",
  },
];

// Default widgets for new users
const DEFAULT_WIDGETS: WidgetType[] = [
  "students",
  "jobs",
  "applications",
  "payRequests",
  "circulation",
  "avgBalance",
  "totalClasses",
  "activeClasses",
];

export default function TeacherDashboard() {
  const { push } = useToast();
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { currentClassId } = useClassContext();

  // Edit mode state
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = React.useState(false);
  
  // Fine dialog state
  const [isIssueFineDialogOpen, setIsIssueFineDialogOpen] = React.useState(false);

  // Load enabled widgets from localStorage
  const [enabledWidgets, setEnabledWidgets] = React.useState<WidgetType[]>(() => {
    const saved = localStorage.getItem("teacher-dashboard-widgets");
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  // Save widgets to localStorage
  React.useEffect(() => {
    localStorage.setItem("teacher-dashboard-widgets", JSON.stringify(enabledWidgets));
  }, [enabledWidgets]);

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

  // Fetch statistics for current class
  const { data: statsData, loading: statsLoading } = useQuery(GET_CLASS_STATISTICS, {
    variables: { classId: currentClassId },
    skip: !currentClassId,
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

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      push({
        title: "Copied!",
        description: `${description} copied to clipboard`,
      });
    } catch (err) {
      push({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (classId: string) => {
    navigate(`/classes/${classId}`);
  };

  const handleManageClass = (classId: string) => {
    navigate(`/classes/${classId}/manage`);
  };

  const classes = classesData?.classesByUser || [];
  const totalClasses = classes.length;
  const activeClasses = classes.filter((cls: any) => !cls.isArchived).length;
  const archivedClasses = classes.filter((cls: any) => cls.isArchived).length;
  
  const stats = (statsData as any)?.classStatistics || null;
  const currentClass = classes.find((cls: any) => cls.id === currentClassId);

  // Widget management functions
  const addWidget = (widgetId: WidgetType) => {
    if (!enabledWidgets.includes(widgetId)) {
      setEnabledWidgets([...enabledWidgets, widgetId]);
      push({ title: "Widget added", description: "Dashboard updated successfully" });
    }
    setIsAddWidgetDialogOpen(false);
  };

  const removeWidget = (widgetId: WidgetType) => {
    setEnabledWidgets(enabledWidgets.filter((id) => id !== widgetId));
    push({ title: "Widget removed", description: "Dashboard updated successfully" });
  };

  const handleWidgetClick = (widget: Widget) => {
    if (isEditMode) return; // Don't navigate in edit mode
    if (widget.route) {
      navigate(widget.route);
    }
  };

  const getVisibleWidgets = () => {
    return AVAILABLE_WIDGETS.filter((w) => enabledWidgets.includes(w.id));
  };

  const getAvailableWidgetsToAdd = () => {
    return AVAILABLE_WIDGETS.filter((w) => !enabledWidgets.includes(w.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Edit your dashboard - Add or remove widgets" : "Overview of all your classroom economies"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditMode && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          )}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Dashboard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white rounded-full p-2">
                <Edit3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Edit Mode Active</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click the X on any widget to remove it, or add new widgets below
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddWidgetDialogOpen(true)}
              size="sm"
              variant="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>
      )}

      {/* Current Class Stats */}
      {currentClass && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{currentClass.name} Overview</h2>
            <p className="text-sm text-muted-foreground">
              {currentClass.subject && currentClass.period 
                ? `${currentClass.subject} • Period ${currentClass.period}`
                : "Current class statistics"}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {getVisibleWidgets().map((widget) => {
              const Icon = widget.icon;
              const value = widget.getValue(stats, classes);
              const subtext = widget.getSubtext(stats, classes);

              return (
                <Card
                  key={widget.id}
                  className={cn(
                    "relative transition-all",
                    widget.route && !isEditMode && "cursor-pointer hover:shadow-lg hover:scale-105",
                    isEditMode && "ring-2 ring-blue-200 dark:ring-blue-800"
                  )}
                  onClick={() => handleWidgetClick(widget)}
                >
                  {isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.id);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10 shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    <Icon className={cn("h-5 w-5", widget.color)} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading && widget.id !== "totalClasses" && widget.id !== "activeClasses" ? "..." : value}
                    </div>
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                    {widget.route && !isEditMode && (
                      <div className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                        Click to view <ExternalLink className="h-3 w-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Fines Widget */}
          {currentClassId && (
            <div className="mt-6">
              <RecentFinesWidget 
                classId={currentClassId} 
                onIssueFineBtnClick={() => setIsIssueFineDialogOpen(true)}
              />
            </div>
          )}
        </div>
      )}



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
              <Card key={cls.id} className={cn("hover:shadow-md transition-shadow", cls.isArchived && "opacity-60")}>
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
                <CardContent className="space-y-4">
                  {/* Join Code Section */}
                  {!cls.isArchived && cls.joinCode && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Join Code</p>
                          <p className="font-mono text-sm font-medium">{cls.joinCode}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(cls.joinCode, "Join code")}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(
                          `Join my class "${cls.name}" with code: ${cls.joinCode}`,
                          "Invitation message"
                        )}
                        className="h-7 text-xs mt-2 w-full"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share Invitation
                      </Button>
                    </div>
                  )}

                  {/* Class Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{cls.defaultCurrency || "CE$"}</span>
                  </div>

                  {/* Action Buttons */}
                  {!cls.isArchived && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(cls.id)}
                        className="flex-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleManageClass(cls.id)}
                        className="flex-1"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>



      {/* Add Widget Dialog */}
      <Dialog open={isAddWidgetDialogOpen} onOpenChange={setIsAddWidgetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Widgets to Dashboard</DialogTitle>
            <DialogDescription>
              Choose from available widgets to customize your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2 max-h-[60vh] overflow-y-auto p-2">
            {getAvailableWidgetsToAdd().length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>All widgets are already on your dashboard!</p>
              </div>
            ) : (
              getAvailableWidgetsToAdd().map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.id}
                    onClick={() => addWidget(widget.id)}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary transition-all text-left group"
                  >
                    <div className={cn("p-2 rounded-lg bg-muted group-hover:bg-background")}>
                      <Icon className={cn("h-5 w-5", widget.color)} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{widget.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {widget.getSubtext(stats, classes)}
                      </p>
                      {widget.route && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Links to {widget.route}
                        </Badge>
                      )}
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Fine Dialog */}
      {currentClassId && (
        <IssueFineDialog
          open={isIssueFineDialogOpen}
          onOpenChange={setIsIssueFineDialogOpen}
          classId={currentClassId}
        />
      )}
    </div>
  );
}
