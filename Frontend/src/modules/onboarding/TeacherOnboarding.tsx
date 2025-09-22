// src/modules/onboarding/TeacherOnboarding.tsx
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import type { CreateClassMutation, CreateClassMutationVariables } from "@/graphql/__generated__/graphql";
import { CREATE_CLASS } from "@/graphql/mutations/createClass";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type OnboardingPrefill = {
  fromSignup?: boolean;
  userId?: string;
  name?: string;
  email?: string;
};

export default function TeacherOnboarding() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: OnboardingPrefill };

  const [prefill, setPrefill] = React.useState<OnboardingPrefill | null>(null);
  React.useEffect(() => {
    const fromState = location?.state ?? null;
    if (fromState) {
      setPrefill(fromState);
      sessionStorage.setItem("onboardingPrefill", JSON.stringify(fromState));
      return;
    }
    try {
      const raw = sessionStorage.getItem("onboardingPrefill");
      if (raw) setPrefill(JSON.parse(raw));
    } catch {}
  }, [location?.state]);

  const [form, setForm] = React.useState({
    name: "",
    subject: "",
    period: "",
    gradeLevel: "",
    schoolName: "",
    district: "",
    payPeriodDefault: "WEEKLY",
    startingBalance: "",
  });

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [createClass, { loading }] = useMutation<CreateClassMutation, CreateClassMutationVariables>(CREATE_CLASS, {
    onCompleted: (data) => {
      sessionStorage.removeItem("onboardingPrefill");
      const newClassId = data?.createClass?.id;
      console.log("Created class with ID:", newClassId);
      if (newClassId) {
        navigate(`/classes/${newClassId}`, { replace: true });
      }
    },
    onError: (err) => {
      setErrorMsg(err.message || "Something went wrong creating the class.");
    },
  });

  function update<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.name.trim()) return setErrorMsg("Class name is required.");
    if (!form.subject.trim()) return setErrorMsg("Subject is required.");
    if (!form.period.trim()) return setErrorMsg("Period is required.");
    if (!form.gradeLevel.trim()) return setErrorMsg("Grade level is required.");

    const gradeLevelNum =
      form.gradeLevel.trim() === "" ? undefined : Number(form.gradeLevel);
    const startingBalanceNum =
      form.startingBalance.trim() === ""
        ? undefined
        : Number(form.startingBalance);

    const input: any = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      period: form.period.trim(),
      gradeLevel: Number.isFinite(gradeLevelNum) ? gradeLevelNum : undefined,
      schoolName: form.schoolName.trim() || undefined,
      district: form.district.trim() || undefined,
      payPeriodDefault: form.payPeriodDefault as
        | "WEEKLY"
        | "BIWEEKLY"
        | "MONTHLY"
        | "SEMESTER",
      startingBalance: Number.isFinite(startingBalanceNum)
        ? startingBalanceNum
        : undefined,
    };

    await createClass({ variables: { input } });
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            {prefill?.name ? `Welcome, ${prefill.name}!` : "Welcome!"} Let’s set
            up your first class
          </CardTitle>
          {prefill?.email && (
            <p className="text-sm text-muted-foreground mt-1">
              Signed in as <span className="font-medium">{prefill.email}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="name">Class name *</Label>
                <Input
                  id="name"
                  placeholder='e.g. "Algebra I - Period 2"'
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Subject *</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) => update("subject", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Language Arts">Language Arts</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  placeholder='e.g. "2nd"'
                  value={form.period}
                  onChange={(e) => update("period", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Grade level *</Label>
                <Select
                  value={form.gradeLevel}
                  onValueChange={(v) => update("gradeLevel", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="schoolName">School (optional)</Label>
                <Input
                  id="schoolName"
                  value={form.schoolName}
                  onChange={(e) => update("schoolName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="district">District (optional)</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                />
              </div>

              <div>
                <Label>Default pay period</Label>
                <Select
                  value={form.payPeriodDefault}
                  onValueChange={(v) => update("payPeriodDefault", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="SEMESTER">Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startingBalance">
                  Starting balance (optional)
                </Label>
                <Input
                  id="startingBalance"
                  type="number"
                  inputMode="numeric"
                  value={form.startingBalance}
                  onChange={(e) => update("startingBalance", e.target.value)}
                />
              </div>
            </div>

            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create class"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            You can customize jobs, store items, fines, and invites after your
            class is created.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
