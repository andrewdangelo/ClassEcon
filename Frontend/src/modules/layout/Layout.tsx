import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useClassContext } from "@/context/ClassContext";
import { cn } from "@/lib/utils";
import { useMutation } from "@apollo/client/react";
import { useAppDispatch } from "@/redux/store/store";
import { clearAuth } from "@/redux/authSlice";
import { LOGOUT } from "@/graphql/mutations/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Layout() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { role } = useClassContext();
  const compact = role === "STUDENT";

  const [logout] = useMutation(LOGOUT, {
    onCompleted: () => {
      dispatch(clearAuth());
      navigate("/auth", { replace: true });
    },
    onError: (err) => {
      console.error("Logout error:", err);
      // Still clear local auth state even if server logout fails
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

  return (
    <div className={cn("min-h-screen", compact ? "md:pl-56" : "md:pl-72")}>
      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="-ml-1 inline-flex items-center justify-center rounded-md p-2 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold">Classroom Economy</span>
          </div>

          {/* Top nav (md+) */}
          <nav className="hidden gap-6 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/classes"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Classes
            </NavLink>
            {role === "TEACHER" && (
              <NavLink
                to="/students"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                Students
              </NavLink>
            )}
            <NavLink
              to="/store"
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Store
            </NavLink>
          </nav>

          {/* Right side: notifications and logout */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
