import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Mail } from "lucide-react";

const VERIFY = gql`
  mutation VerifyEmailWithCode($code: String!) {
    verifyEmailWithCode(code: $code) {
      success
      message
    }
  }
`;

const RESEND = gql`
  mutation ResendEmailVerificationCode {
    resendEmailVerificationCode {
      success
      message
    }
  }
`;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verify, { loading: vLoading }] = useMutation(VERIFY);
  const [resend, { loading: rLoading }] = useMutation(RESEND);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await verify({ variables: { code: code.trim() } });
      const m = (data as any)?.verifyEmailWithCode?.message as string | undefined;
      if ((data as any)?.verifyEmailWithCode?.success) {
        setMsg(m || "Verified — redirecting…");
        navigate("/", { replace: true });
      } else {
        setMsg(m || "Could not verify.");
      }
    } catch (err: any) {
      setMsg(err?.message || "Verification failed.");
    }
  };

  const onResend = async () => {
    setMsg(null);
    try {
      const { data } = await resend();
      const m = (data as any)?.resendEmailVerificationCode?.message as string | undefined;
      setMsg(m || "Sent.");
    } catch (err: any) {
      setMsg(err?.message || "Could not resend.");
    }
  };

  return (
    <div className="auth-shell">
      <Card className="w-full max-w-md border border-border/80 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl">
            <Mail className="h-6 w-6 text-primary" />
            Verify your email
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your inbox. It expires in a few minutes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="h-11 text-center tracking-widest font-mono text-lg"
              />
            </div>
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={onResend} disabled={rLoading}>
              {rLoading ? "Sending…" : "Resend code"}
            </Button>
            <Button type="submit" disabled={vLoading || code.length < 4}>
              {vLoading ? "Checking…" : "Verify"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
