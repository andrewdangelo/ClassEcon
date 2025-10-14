import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@apollo/client/react";
import { LOGOUT } from "@/graphql/mutations/auth";
import { useAppDispatch } from "@/redux/store/store";
import { clearAuth } from "@/redux/authSlice";
import { useLanguage } from "@/i18n/LanguageContext";

export function ProfileMenu() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

  if (!user) return null;

  // Get initials from username
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = user.name ? getInitials(user.name) : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("navigation.settings")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("auth.signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
