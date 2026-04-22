import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

const RESET = gql`
  mutation ResetPassword($email: String!, $token: String!, $newPassword: String!) {
    resetPassword(email: $email, token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const emailParam = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [resetPassword, { loading }] = useMutation(RESET);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    if (!email.trim() || !token) {
      setMsg("This reset link is missing required fields. Request a new email from the login page.");
      return;
    }
    try {
      const { data } = await resetPassword({
        variables: {
          email: email.trim().toLowerCase(),
          token: token.trim(),
          newPassword: password,
        },
      });
      const row = (data as any)?.resetPassword;
      if (row?.success) {
        setDone(true);
        setMsg(row.message || "Password updated.");
      } else {
        setMsg(row?.message || "Reset failed.");
      }
    } catch (err: any) {
      setMsg(err?.message || "Reset failed.");
    }
  };

  return (
    <div className="auth-shell">
      <Card className="w-full max-w-md border border-border/80 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl">
            <Lock className="h-6 w-6 text-primary" />
            Set a new password
          </CardTitle>
          <CardDescription>
            Choose a new password for your ClassEcon account.
          </CardDescription>
        </CardHeader>
        {done ? (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{msg}</p>
            <Button asChild className="w-full">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw">New password</Label>
                <Input
                  id="pw"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw2">Confirm password</Label>
                <Input
                  id="pw2"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-11"
                />
              </div>
              {msg && <p className="text-sm text-destructive">{msg}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Update password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
