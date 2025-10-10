import React from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { MeQuery } from "@/graphql/__generated__/graphql";
import { ClassSwitcher } from "./ClassSwitcher";
import { useClassContext } from "@/context/ClassContext";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  ShoppingBag,
  Users,
  Inbox,
  Package,
  Backpack,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: any; roles: string[] };

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
  { to: "/students", label: "Students", icon: Users, roles: ["TEACHER"] },
  {
    to: "/store",
    label: "Store",
    icon: ShoppingBag,
    roles: ["TEACHER", "STUDENT"],
  },
  { to: "/backpack", label: "Backpack", icon: Backpack, roles: ["STUDENT"] },
  { to: "/requests", label: "Requests", icon: Inbox, roles: ["TEACHER", "STUDENT"] },
  { to: "/redemptions", label: "Redemptions", icon: Package, roles: ["TEACHER"] },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { role: contextRole } = useClassContext();
  const { data, loading, error } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-and-network",
  });

  const user = data?.me;
  const role = user?.role || contextRole || "STUDENT"; // Default to STUDENT if both are undefined
  const username = user?.name || "—";

  // Debug: log the current role
  console.log("Sidebar role detection:", { 
    userRole: user?.role, 
    contextRole, 
    finalRole: role,
    loading,
    error: error?.message
  });

  // Debug: Check NAV_ITEMS filtering
  console.log("NAV_ITEMS filtering:", {
    role,
    NAV_ITEMS,
    visible: NAV_ITEMS.filter((n) => n.roles.includes(role)),
    requestsItem: NAV_ITEMS.find(n => n.to === "/requests"),
    includesStudent: NAV_ITEMS.find(n => n.to === "/requests")?.roles.includes("STUDENT")
  });

  const compact = role === "STUDENT"; // auto-compact for students
  const visible = NAV_ITEMS.filter((n) => n.roles.includes(role));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r bg-background p-3 transition-transform duration-200 ease-out overflow-y-auto",
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
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Signed in as</span>
          <span className="text-sm font-medium truncate">
            {loading ? "…" : error ? "Error" : username}
          </span>
        </div>
        <span className="rounded-md border px-2 py-1 text-xs uppercase">
          {role?.toLowerCase() || "—"}
        </span>
      </div>

      <ClassSwitcher className={cn("mb-3", compact && "hidden md:block")} meId={user?.id} />

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
