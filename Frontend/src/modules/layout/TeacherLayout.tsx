import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, GraduationCap, Users, ShoppingBag, Inbox } from "lucide-react";
import { ClassSwitcher } from "@/components/sidebar/ClassSwitcher";
import { useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { MeQuery } from "@/graphql/__generated__/graphql";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ProfileMenu } from "@/components/profile/ProfileMenu";

const TEACHER_NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: BookOpen },
  { to: "/classes", label: "Classes", icon: GraduationCap },
  { to: "/students", label: "Students", icon: Users },
  { to: "/store", label: "Store", icon: ShoppingBag },
  { to: "/requests", label: "Requests", icon: Inbox },
];

export function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const user = useAppSelector(selectUser);

  const { data: meData, loading } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-and-network",
  });

  const displayUser = meData?.me || user;
  const username = displayUser?.name || "—";

  return (
    <div className="min-h-screen md:pl-72">
      {/* Teacher Sidebar - Full width for comprehensive tools */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r bg-background p-4 transition-transform duration-200 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
        aria-label="Teacher navigation"
      >
        {/* User info */}
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="text-sm font-medium truncate">
              {loading ? "…" : username}
            </span>
          </div>
          <span className="rounded-md border px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
            Teacher
          </span>
        </div>

        {/* Class switcher */}
        <ClassSwitcher className="mb-4" meId={displayUser?.id} />

        {/* Navigation */}
        <nav className="space-y-2">
          {TEACHER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Teacher-specific tools section */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Teacher Tools
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <GraduationCap className="h-4 w-4" />
              <span>Class Analytics</span>
            </button>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <Users className="h-4 w-4" />
              <span>Grade Reports</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="-ml-1 inline-flex items-center justify-center rounded-md p-2 md:hidden"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold text-lg">Classroom Economy</h1>
              <p className="text-xs text-muted-foreground">Teacher Dashboard</p>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden gap-6 md:flex">
            {TEACHER_NAV_ITEMS.slice(0, 4).map((item) => (
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

          {/* Right side: notifications and profile */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ProfileMenu />
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

export default TeacherLayout;
