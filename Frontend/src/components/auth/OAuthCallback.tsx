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

export function OAuthCallback({ provider }: OAuthCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [oauthLogin] = useMutation(OAUTH_LOGIN);

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
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Completing authentication...
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Please wait while we sign you in with {provider === "google" ? "Google" : "Microsoft"}
        </p>
      </div>
    </div>
  );
}
