// Frontend/src/components/auth/OAuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { OAUTH_LOGIN } from "@/graphql/mutations/auth";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/authSlice";
import { Loader2 } from "lucide-react";

interface OAuthCallbackProps {
  provider: "google" | "microsoft";
}

interface OAuthLoginData {
  oauthLogin?: {
    user: any;
    accessToken: string;
  } | null;
}

interface OAuthLoginVars {
  provider: string;
  code: string;
}

export function OAuthCallback({ provider }: OAuthCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [oauthLogin] = useMutation<OAuthLoginData, OAuthLoginVars>(OAUTH_LOGIN);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error(`OAuth error: ${error}`);
        navigate("/auth?error=" + encodeURIComponent(error));
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        navigate("/auth?error=no_code");
        return;
      }

      try {
        const { data } = await oauthLogin({
          variables: {
            provider: provider.toUpperCase(),
            code,
          },
        });

        if (data?.oauthLogin) {
          const { user, accessToken } = data.oauthLogin;
          
          // Store credentials in Redux
          dispatch(
            setCredentials({
              user,
              accessToken,
            })
          );

          // Store access token in localStorage
          localStorage.setItem("accessToken", accessToken);

          // Redirect to dashboard
          navigate("/");
        } else {
          throw new Error("No data returned from OAuth login");
        }
      } catch (err: any) {
        console.error("OAuth login error:", err);
        navigate("/auth?error=" + encodeURIComponent(err.message || "Authentication failed"));
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch, oauthLogin, provider]);

  return (
    <div className="auth-shell">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Completing authentication…
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we sign you in with {provider === "google" ? "Google" : "Microsoft"}
        </p>
      </div>
    </div>
  );
}
