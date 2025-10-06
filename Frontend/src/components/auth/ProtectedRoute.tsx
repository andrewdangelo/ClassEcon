import React from "react";
import { useQuery } from "@apollo/client/react";
import { LoginSignupCard } from "./LoginSignupCard";
import { ME } from "../../graphql/queries/me";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, loading, error } = useQuery(ME, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });

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
