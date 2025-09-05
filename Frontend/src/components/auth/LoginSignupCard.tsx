import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import { LOGIN, SIGN_UP } from "../../graphql/operations";
import { useAppDispatch } from "../../redux/store/store";
import { setCredentials } from "../../redux/authSlice";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = ["TEACHER", "STUDENT", "PARENT"] as const;

type Mode = "login" | "signup";

type LoginForm = { email: string; password: string };

type SignupForm = {
  name: string;
  email: string;
  password: string;
  role: (typeof roles)[number];
};

export const LoginSignupCard: React.FC<{ defaultMode?: Mode }> = ({
  defaultMode = "login",
}) => {
  const [mode, setMode] = React.useState<Mode>(defaultMode);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm & SignupForm>({
    defaultValues: { role: "STUDENT" as any },
  });

  const [doLogin, { error: loginError }] = useMutation(LOGIN);
  const [doSignup, { error: signupError }] = useMutation(SIGN_UP);

  const onSubmit = async (data: any) => {
    if (mode === "login") {
      const res = await doLogin({
        variables: { email: data.email, password: data.password },
      });
      const payload = res.data?.login;
      if (payload?.accessToken && payload?.user)
        dispatch(setCredentials(payload));
    } else {
      const res = await doSignup({
        variables: {
          input: {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
          },
        },
      });
      const payload = res.data?.signUp;
      if (payload?.accessToken && payload?.user)
        dispatch(setCredentials(payload));
    }
  };

  const err = loginError?.message || signupError?.message;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {mode === "login" ? "Log in" : "Create an account"}
          </CardTitle>
          <Button
            variant="ghost"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: true })} />
                {errors.name && (
                  <p className="text-sm text-red-500">Required</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
              />
              {errors.email && <p className="text-sm text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true, minLength: 6 })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">Min 6 characters</p>
              )}
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="border rounded-md h-9 px-3"
                  {...register("role", { required: true })}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {err && <p className="text-sm text-red-600">{err}</p>}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {mode === "login" ? "Log in" : "Sign up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
