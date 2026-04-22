import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const ME_FOR_EMAIL = gql`
  query EmailGuard_Me {
    me {
      id
      email
      role
      emailVerified
      oauthProvider
    }
  }
`;

type MeRow = {
  id: string;
  email?: string | null;
  role: string;
  emailVerified: boolean;
  oauthProvider?: string | null;
};

/**
 * Forces password-based accounts to confirm email (OTP) before entering the app shell.
 */
export const EmailVerificationGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const { data, loading } = useQuery<{ me?: MeRow | null }>(ME_FOR_EMAIL, {
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-4 text-sm text-muted-foreground">
        Checking your account…
      </div>
    );
  }

  const me = data?.me;
  if (!me) {
    return <>{children}</>;
  }

  const needsVerify =
    Boolean(me.email) &&
    !me.oauthProvider &&
    me.emailVerified === false;

  const onVerifyRoute = location.pathname === "/auth/verify-email";

  if (needsVerify && !onVerifyRoute) {
    return <Navigate to="/auth/verify-email" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
