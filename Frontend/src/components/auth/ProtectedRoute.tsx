import React, { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { LoginSignupCard } from "./LoginSignupCard";
import { ME } from "../../graphql/queries/me";
import { useAppDispatch, useAppSelector } from "../../redux/store/store";
import { setCredentials, selectUser } from "../../redux/authSlice";
import { MeQuery } from "../../graphql/__generated__/graphql";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const storedUser = useAppSelector(selectUser);
  
  const { data, loading, error } = useQuery<MeQuery>(ME, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });

  // Update Redux when ME query succeeds (e.g., on page reload with valid refresh token)
  useEffect(() => {
    if (data?.me && !storedUser) {
      dispatch(setCredentials({
        // We don't have the access token from the ME query, but it will be refreshed
        // The auth link will get a fresh token via the responseLink when needed
        accessToken: "", 
        user: {
          id: data.me.id,
          name: data.me.name,
          email: data.me.email || "",
          role: data.me.role as "TEACHER" | "STUDENT" | "PARENT",
        },
      }));
    }
  }, [data, storedUser, dispatch]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data?.me) {
    return <>{children}</>;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <LoginSignupCard />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <LoginSignupCard />
    </div>
  );
};
