import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useClassContext } from "@/context/ClassContext";
import { cn } from "@/lib/utils";

export function Layout() {
  const [open, setOpen] = React.useState(false);
  const { role, setRole, currentStudentId, setCurrentStudentId } =
    useClassContext();
  const compact = role === "STUDENT";

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

          {/* Right side: sign in + temporary role toggle */}
          <div className="flex items-center gap-2">
            <Button variant="secondary">Sign in</Button>
            {/* Temporary role toggle for testing */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "TEACHER" | "STUDENT")}
              className="rounded-md border px-2 py-1 text-sm"
              aria-label="Switch role"
            >
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
            {role === "STUDENT" && (
              <select
                value={currentStudentId ?? ""}
                onChange={(e) => setCurrentStudentId(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
                aria-label="Pick demo student"
              >
                {/* keep in sync with mock student IDs present in chosen class */}
                <option value="s1">Ava M.</option>
                <option value="s2">Liam K.</option>
                <option value="s3">Noah S.</option>
                <option value="s4">Emma R.</option>
                <option value="s5">Olivia C.</option>
              </select>
            )}
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
