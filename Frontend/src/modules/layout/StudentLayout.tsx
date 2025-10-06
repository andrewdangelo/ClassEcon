import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, BookOpen, GraduationCap, ShoppingBag } from "lucide-react";
import { ClassSwitcher } from "@/components/sidebar/ClassSwitcher";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { MeQuery } from "@/graphql/__generated__/graphql";
import { LOGOUT } from "@/graphql/mutations/auth";
import { useAppDispatch, useAppSelector } from "@/redux/store/store";
import { clearAuth, selectUser } from "@/redux/authSlice";
import { cn } from "@/lib/utils";

const STUDENT_NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: BookOpen },
  { to: "/classes", label: "My Classes", icon: GraduationCap },
  { to: "/store", label: "Store", icon: ShoppingBag },
];

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const { data: meData, loading } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-and-network",
  });

  const [logout] = useMutation(LOGOUT, {
    onCompleted: () => {
      dispatch(clearAuth());
      navigate("/auth", { replace: true });
    },
    onError: (err) => {
      console.error("Logout error:", err);
      dispatch(clearAuth());
      navigate("/auth", { replace: true });
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error handling is in the onError callback
    }
  };

  const displayUser = meData?.me || user;
  const username = displayUser?.name || "—";

  return (
    <div className="min-h-screen md:pl-56">
      {/* Student Sidebar - Compact for simplified navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 border-r bg-background p-3 transition-transform duration-200 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
        aria-label="Student navigation"
      >
        {/* User info */}
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="text-sm font-medium truncate">
              {loading ? "…" : username}
            </span>
          </div>
          <span className="rounded-md border px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border-green-200">
            Student
          </span>
        </div>

        {/* Class switcher - hidden on mobile for compact design */}
        <ClassSwitcher className="mb-3 hidden md:block" meId={displayUser?.id} />

        {/* Navigation */}
        <nav className="space-y-1">
          {STUDENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
                title={item.label}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate hidden md:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Student-specific quick actions */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 hidden md:block">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">My Assignments</span>
            </button>
            <button className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">My Purchases</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="-ml-1 inline-flex items-center justify-center rounded-md p-2 md:hidden"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <span className="font-semibold">Classroom Economy</span>
              <span className="hidden sm:inline text-muted-foreground text-sm ml-2">Student Portal</span>
            </div>
          </div>

          {/* Desktop navigation - simplified for students */}
          <nav className="hidden gap-6 md:flex">
            {STUDENT_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side: logout */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
