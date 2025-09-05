import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export function AuthDialog({
  triggerText = "Sign up",
}: {
  triggerText?: string;
}) {
  const { login, signUp } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("login");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as "TEACHER" | "STUDENT" | "PARENT",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await signUp({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Log in" : "Create account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          {mode === "signup" && (
            <>
              <div className="grid gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="border rounded-md h-9 px-2"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as any }))
                  }
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>
            </>
          )}
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="flex items-center justify-between gap-2 mt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Log in"
                : "Sign up"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setMode((m) => (m === "login" ? "signup" : "login"))
              }
            >
              {mode === "login" ? "Create account" : "Have an account? Log in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
