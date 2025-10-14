import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import { LOGIN, SIGN_UP } from "../../graphql/operations";
import { useAppDispatch } from "../../redux/store/store";
import { setCredentials } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Code } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = ["TEACHER", "STUDENT", "PARENT"] as const;

type LoginForm = { email: string; password: string };
type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: (typeof roles)[number];
  joinCode?: string;
};

// OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || "";
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:4001";

export const ModernAuth: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginForm>();

  // Signup form
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSigningUp },
    watch: watchSignup,
    reset: resetSignup,
  } = useForm<SignupForm>({ defaultValues: { role: "STUDENT" } });

  const watchedRole = watchSignup("role");
  const watchedPassword = watchSignup("password");

  const [doLogin, { error: loginError }] = useMutation<
    { login: { accessToken: string; user: any } },
    { email: string; password: string }
  >(LOGIN);
  const [doSignup, { error: signupError }] = useMutation<
    { signUp: { accessToken: string; user: any } },
    { input: any }
  >(SIGN_UP);

  const onLogin = async (data: LoginForm) => {
    const res = await doLogin({
      variables: { email: data.email, password: data.password },
    });
    const payload = res.data?.login;
    if (payload?.accessToken && payload?.user) {
      dispatch(
        setCredentials({
          accessToken: payload.accessToken,
          user: {
            ...payload.user,
            role: payload.user.role as "TEACHER" | "STUDENT" | "PARENT",
          },
        })
      );
      navigate("/");
    }
  };

  const onSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    const res = await doSignup({
      variables: {
        input: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          ...(data.joinCode && data.joinCode.trim()
            ? { joinCode: data.joinCode.trim() }
            : {}),
        },
      },
    });

    const payload = res.data?.signUp;
    if (payload?.accessToken && payload?.user) {
      dispatch(
        setCredentials({
          accessToken: payload.accessToken,
          user: {
            ...payload.user,
            role: payload.user.role as "TEACHER" | "STUDENT" | "PARENT",
          },
        })
      );

      const isTeacher = (payload.user.role ?? data.role) === "TEACHER";
      if (isTeacher) {
        const onboardState = {
          fromSignup: true,
          userId: payload.user.id,
          name: payload.user.name,
          email: payload.user.email,
        };
        sessionStorage.setItem("onboardingPrefill", JSON.stringify(onboardState));
        navigate("/onboarding", { replace: true, state: onboardState });
      } else {
        navigate("/");
      }
      resetSignup();
    }
  };

  // OAuth handlers
  const handleGoogleAuth = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert("Google OAuth is not configured");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = authUrl;
  };

  const handleMicrosoftAuth = () => {
    if (!MICROSOFT_CLIENT_ID) {
      alert("Microsoft OAuth is not configured");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback/microsoft`;
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ClassEcon
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Modern classroom economy management
          </p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="username"
                      className="h-11"
                      {...registerLogin("email", { required: "Email is required" })}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-red-500">{loginErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 pr-10"
                        {...registerLogin("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Min 6 characters" },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                    )}
                  </div>

                  {loginError?.message && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {loginError.message}
                      </p>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoggingIn} className="w-full h-11">
                    {isLoggingIn ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      className="h-11"
                      {...registerSignup("name", { required: "Name is required" })}
                    />
                    {signupErrors.name && (
                      <p className="text-sm text-red-500">{signupErrors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11"
                      {...registerSignup("email", { required: "Email is required" })}
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-red-500">{signupErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-11 pr-10"
                        {...registerSignup("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Min 6 characters" },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-sm text-red-500">{signupErrors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-11 pr-10"
                        {...registerSignup("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === watchedPassword || "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {signupErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">I am a...</Label>
                    <select
                      id="signup-role"
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...registerSignup("role", { required: true })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="PARENT">Parent</option>
                    </select>
                  </div>

                  {watchedRole === "STUDENT" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-join-code" className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Class Join Code <span className="text-xs text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="signup-join-code"
                        placeholder="e.g., ABC123"
                        className="h-11"
                        {...registerSignup("joinCode")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get this from your teacher to join a class
                      </p>
                    </div>
                  )}

                  {signupError?.message && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {signupError.message}
                      </p>
                    </div>
                  )}

                  <Button type="submit" disabled={isSigningUp} className="w-full h-11">
                    {isSigningUp ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* OAuth Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="h-11"
                  disabled={!GOOGLE_CLIENT_ID}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMicrosoftAuth}
                  className="h-11"
                  disabled={!MICROSOFT_CLIENT_ID}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M13 1h10v10H13z" />
                    <path fill="#7fba00" d="M1 13h10v10H1z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                  Microsoft
                </Button>
              </div>
            </div>

            {/* Terms & Privacy */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need help? Contact{" "}
          <a href="mailto:support@classecon.com" className="underline underline-offset-4 hover:text-primary">
            support@classecon.com
          </a>
        </p>
      </div>
    </div>
  );
};
