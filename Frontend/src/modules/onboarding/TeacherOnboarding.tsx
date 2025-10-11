// src/modules/onboarding/TeacherOnboarding.tsx
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import type { CreateClassMutation, CreateClassMutationVariables } from "@/graphql/__generated__/graphql";
import { CREATE_CLASS } from "@/graphql/mutations/createClass";
import { gql } from "@apollo/client";
import { GraduationCap, ArrowRight, CheckCircle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const CLASSES_FOR_GUARD = gql`
  query RequireClass_Classes {
    classes { id teacherIds }
  }
`;

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
    description: "",
    subject: "",
    period: "",
    gradeLevel: "",
    schoolName: "",
    district: "",
    payPeriodDefault: "WEEKLY",
    startingBalance: "0",
    defaultCurrency: "CE$",
    allowNegative: false,
    requireFineReason: true,
  });

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [createClass, { loading }] = useMutation<CreateClassMutation, CreateClassMutationVariables>(CREATE_CLASS, {
    refetchQueries: [{ query: CLASSES_FOR_GUARD }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      sessionStorage.removeItem("onboardingPrefill");
      const newClassId = data?.createClass?.id;
      // Redirect to dashboard root so user sees full app shell
      if (newClassId) {
        navigate(`/`, { replace: true, state: { newClassId } });
      } else {
        navigate(`/`, { replace: true });
      }
    },
    onError: (err) => {
      setErrorMsg(err.message || "Something went wrong creating the class.");
    },
  });

  function update<K extends keyof typeof form>(key: K, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.name.trim()) return setErrorMsg("Class name is required.");
    if (!form.subject.trim()) return setErrorMsg("Subject is required.");

    const gradeLevelNum =
      form.gradeLevel.trim() === "" ? undefined : Number(form.gradeLevel);
    const startingBalanceNum =
      form.startingBalance.trim() === ""
        ? 0
        : Number(form.startingBalance);

    const input: any = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      subject: form.subject.trim(),
      period: form.period.trim() || undefined,
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
        : 0,
      defaultCurrency: form.defaultCurrency || "CE$",
      storeSettings: {
        allowNegativeBalance: form.allowNegative,
        requireFineReason: form.requireFineReason,
      },
    };

    await createClass({ variables: { input } });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {prefill?.name ? `Welcome, ${prefill.name}!` : "Welcome to ClassEcon"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your first classroom economy
          </p>
          {prefill?.email && (
            <p className="text-sm text-muted-foreground mt-2">
              Signed in as <span className="font-medium">{prefill.email}</span>
            </p>
          )}
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Class Setup</CardTitle>
            <CardDescription>
              Fill in the details below to create your classroom economy. You can always change these later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      placeholder='e.g. "Algebra I - Period 2"'
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your class..."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={3}
                      className="mt-1.5 resize-none"
                    />
                  </div>

                  <div>
                    <Label>Subject *</Label>
                    <Select
                      value={form.subject}
                      onValueChange={(v) => update("subject", v)}
                    >
                      <SelectTrigger className="mt-1.5">
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
                    <Label htmlFor="period">Period</Label>
                    <Input
                      id="period"
                      placeholder='e.g. "2nd"'
                      value={form.period}
                      onChange={(e) => update("period", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Grade Level</Label>
                    <Select
                      value={form.gradeLevel}
                      onValueChange={(v) => update("gradeLevel", v)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="schoolName">School (optional)</Label>
                    <Input
                      id="schoolName"
                      placeholder="Your school name"
                      value={form.schoolName}
                      onChange={(e) => update("schoolName", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district">District (optional)</Label>
                    <Input
                      id="district"
                      placeholder="Your district"
                      value={form.district}
                      onChange={(e) => update("district", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Economy Settings */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Economy Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Default Pay Period</Label>
                    <Select
                      value={form.payPeriodDefault}
                      onValueChange={(v) => update("payPeriodDefault", v)}
                    >
                      <SelectTrigger className="mt-1.5">
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
                    <Label htmlFor="startingBalance">Starting Balance</Label>
                    <Input
                      id="startingBalance"
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={form.startingBalance}
                      onChange={(e) => update("startingBalance", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="defaultCurrency">Currency Symbol</Label>
                    <Input
                      id="defaultCurrency"
                      placeholder="CE$"
                      value={form.defaultCurrency}
                      onChange={(e) => update("defaultCurrency", e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: CE$ (Class Economy Dollar)
                    </p>
                  </div>
                </div>
              </div>

              {/* Store & Fine Settings */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Store & Fine Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowNegative" className="text-base font-medium">
                        Allow Negative Balances
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Students can spend more than they have (go into debt)
                      </p>
                    </div>
                    <Switch
                      id="allowNegative"
                      checked={form.allowNegative}
                      onCheckedChange={(checked: boolean) => update("allowNegative", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireFineReason" className="text-base font-medium">
                        Require Fine Reason
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require a reason when issuing fines to students
                      </p>
                    </div>
                    <Switch
                      id="requireFineReason"
                      checked={form.requireFineReason}
                      onCheckedChange={(checked: boolean) => update("requireFineReason", checked)}
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  You can customize jobs, store items, and more after creation
                </p>
                <Button type="submit" disabled={loading} size="lg" className="gap-2">
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      Create Class
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
