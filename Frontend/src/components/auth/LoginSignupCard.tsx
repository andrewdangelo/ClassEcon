import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import { LOGIN, SIGN_UP } from "../../graphql/operations";
import { useAppDispatch } from "../../redux/store/store";
import { setCredentials } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// NOTE: if your Label file is actually lowercase (`/label`), update this import path:
import { Label } from "@/components/ui/Label";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogClose,
} from "@/components/ui/dialog";

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

type LoginPayload = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
};
type SignupPayload = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
};

export const LoginSignupCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Login form ---
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginForm>();

  // --- Signup form (inside modal) ---
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSigningUp },
    reset: resetSignup,
    watch: watchSignup,
  } = useForm<SignupForm>({ defaultValues: { role: "STUDENT" } });

  // Watch the role and password fields
  const watchedRole = watchSignup("role");
  const watchedPassword = watchSignup("password");

  const [doLogin, { error: loginError }] = useMutation<
    { login: LoginPayload },
    { email: string; password: string }
  >(LOGIN);

  const [doSignup, { error: signupError }] = useMutation<
    { signUp: SignupPayload },
    { input: { name: string; email: string; password: string; role: string; joinCode?: string } }
  >(SIGN_UP);

  const onLogin = async (data: LoginForm) => {
    const res = await doLogin({
      variables: { email: data.email, password: data.password },
    });
    const payload = res.data?.login;
    if (payload?.accessToken && payload?.user) {
      dispatch(setCredentials({
        accessToken: payload.accessToken,
        user: {
          ...payload.user,
          role: payload.user.role as "TEACHER" | "STUDENT" | "PARENT"
        }
      }));
      // Navigate to root after successful login
      navigate("/");
    }
  };

  const onSignup = async (data: SignupForm) => {
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      // You might want to add this as a form error instead
      alert("Passwords do not match");
      return;
    }

    const res = await doSignup({
      variables: {
        input: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          ...(data.joinCode && data.joinCode.trim() ? { joinCode: data.joinCode.trim() } : {}),
        },
      },
    });

    const payload = res.data?.signUp;
    if (payload?.accessToken && payload?.user) {
      dispatch(setCredentials({
        accessToken: payload.accessToken,
        user: {
          ...payload.user,
          role: payload.user.role as "TEACHER" | "STUDENT" | "PARENT"
        }
      }));
      // preserve info for onboarding
      const isTeacher = (payload.user.role ?? data.role) === "TEACHER";
      if (isTeacher) {
        const onboardState = {
          fromSignup: true,
          userId: payload.user.id,
          name: payload.user.name,
          email: payload.user.email,
        };
        // survive page refresh:
        sessionStorage.setItem(
          "onboardingPrefill",
          JSON.stringify(onboardState)
        );
        // navigate to onboarding:
        navigate("/onboarding", { replace: true, state: onboardState });
      } else {
        // For students, navigate to main app
        navigate("/");
      }
      resetSignup();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>

        {/* LOGIN FORM ONLY */}
        <form onSubmit={handleLoginSubmit(onLogin)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email / Username</Label>
              <Input
                id="login-email"
                type="text"
                autoComplete="username"
                {...registerLogin("email", { required: true })}
              />
              {loginErrors.email && (
                <p className="text-sm text-red-500">Required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...registerLogin("password", { required: true, minLength: 6 })}
              />
              {loginErrors.password && (
                <p className="text-sm text-red-500">Min 6 characters</p>
              )}
            </div>

            {loginError?.message && (
              <p className="text-sm text-red-600">{loginError.message}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Log in"}
            </Button>
          </CardFooter>
        </form>

        {/* "or Sign up" */}
        <div className="pb-6 -mt-2">
          <Dialog>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>or</span>
              <DialogTrigger asChild>
                <Button variant="link" type="button" className="px-1">
                  Sign up
                </Button>
              </DialogTrigger>
            </div>

            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Create an account</DialogTitle>
                <DialogDescription>
                  Fill in your details to get started.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSignupSubmit(onSignup)}
                className="space-y-4 py-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    {...registerSignup("name", { required: true })}
                  />
                  {signupErrors.name && (
                    <p className="text-sm text-red-500">Required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    {...registerSignup("email", { required: true })}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-red-500">Required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    {...registerSignup("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Min 6 characters" },
                    })}
                  />
                  {signupErrors.password && (
                    <p className="text-sm text-red-500">{signupErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    {...registerSignup("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => 
                        value === watchedPassword || "Passwords do not match"
                    })}
                  />
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{signupErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <select
                    id="signup-role"
                    className="border rounded-md h-9 px-3 w-full bg-background"
                    {...registerSignup("role", { required: true })}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show join code field only for students */}
                {watchedRole === "STUDENT" && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-join-code">
                      Class Join Code <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="signup-join-code"
                      placeholder="Enter class code (e.g., ABC123)"
                      {...registerSignup("joinCode")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this code from your teacher to join a class immediately
                    </p>
                    {signupErrors.joinCode && (
                      <p className="text-sm text-red-500">{signupErrors.joinCode.message}</p>
                    )}
                  </div>
                )}

                {signupError?.message && (
                  <p className="text-sm text-red-600">{signupError.message}</p>
                )}

                <DialogFooterUI className="gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSigningUp}>
                    {isSigningUp ? "Creating..." : "Sign up"}
                  </Button>
                </DialogFooterUI>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};
