import React from "react";
import { NavLink } from "react-router-dom";
import { ClassSwitcher } from "./ClassSwitcher";
import { useClassContext, Role } from "@/context/ClassContext";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, ShoppingBag, Users } from "lucide-react";

type NavItem = { to: string; label: string; icon: any; roles: Role[] };

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: BookOpen,
    roles: ["TEACHER", "STUDENT"],
  },
  {
    to: "/classes",
    label: "Classes",
    icon: GraduationCap,
    roles: ["TEACHER", "STUDENT"],
  },
  { to: "/students", label: "Students", icon: Users, roles: ["TEACHER"] }, // admin-only
  {
    to: "/store",
    label: "Store",
    icon: ShoppingBag,
    roles: ["TEACHER", "STUDENT"],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { role } = useClassContext();
  const compact = role === "STUDENT"; // auto-compact for students
  const visible = NAV_ITEMS.filter((n) => n.roles.includes(role));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r bg-background p-3 transition-transform duration-200 ease-out",
        compact ? "w-56" : "w-72",
        open ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
      aria-label="Sidebar navigation"
    >
      <div
        className={cn(
          "mb-3 flex items-center justify-between",
          compact ? "px-1" : "px-2"
        )}
      >
        <div className="text-xs text-muted-foreground">Signed in as</div>
        <span className="rounded-md border px-2 py-1 text-xs uppercase">
          {role.toLowerCase()}
        </span>
      </div>

      <ClassSwitcher className={cn("mb-3", compact && "hidden md:block")} />

      <nav className="space-y-1">
        {visible.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
              title={n.label}
              aria-label={n.label}
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              {/* Hide label on md+ for compact student view */}
              <span className={cn("truncate", compact && "hidden md:inline")}>
                {n.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
