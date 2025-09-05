import React from "react";
import { useAppSelector } from "../../redux/store/store";
import { selectAccessToken } from "../../redux/authSlice";
import { LoginSignupCard } from "./LoginSignupCard";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = useAppSelector(selectAccessToken);
  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <LoginSignupCard />
      </div>
    );
  }
  return <>{children}</>;
};
