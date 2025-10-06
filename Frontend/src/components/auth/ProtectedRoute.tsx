import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "../../redux/store/store";
import { selectAccessToken } from "../../redux/authSlice";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = useAppSelector(selectAccessToken);
  const location = useLocation();
  const from = `${location.pathname}${location.search}${location.hash}`;

  if (!token) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: from || undefined,
        }}
      />
    );
  }
  return <>{children}</>;
};
