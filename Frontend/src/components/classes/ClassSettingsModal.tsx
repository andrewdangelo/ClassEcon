import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { UPDATE_CLASS, ROTATE_JOIN_CODE } from "@/graphql/mutations/createClass";

const GET_CLASS_SETTINGS = gql`
  query GetClassSettings($id: ID!) {
    class(id: $id) {
      id
      name
      description
      subject
      period
      gradeLevel
      joinCode
      schoolName
      district
      payPeriodDefault
      startingBalance
      defaultCurrency
      isArchived
    }
  }
`;

type PayPeriod = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "SEMESTER";

interface ClassSettingsData {
  class: {
    id: string;
    name: string;
    description?: string | null;
    subject?: string | null;
    period?: string | null;
    gradeLevel?: number | null;
    joinCode: string;
    schoolName?: string | null;
    district?: string | null;
    payPeriodDefault?: PayPeriod | null;
    startingBalance?: number | null;
    defaultCurrency?: string | null;
    isArchived: boolean;
  } | null;
}

interface ClassSettingsModalProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

interface FormData {
  name: string;
  description: string;
  subject: string;
  period: string;
  gradeLevel: string;
  schoolName: string;
  district: string;
  payPeriodDefault: PayPeriod | "";
  startingBalance: string;
  defaultCurrency: string;
  isArchived: boolean;
}

const SUBJECTS = ["Math", "Science", "English", "History", "Language Arts", "Social Studies", "Art", "Music", "Physical Education", "Other"];
const GRADES = [6, 7, 8, 9, 10, 11, 12];
const PAY_PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "SEMESTER", label: "Semester" },
];

export function ClassSettingsModal({
  classId,
  open,
  onOpenChange,
  onUpdated,
}: ClassSettingsModalProps) {
  const { push } = useToast();
  
  const { data, loading: queryLoading, refetch } = useQuery<ClassSettingsData>(GET_CLASS_SETTINGS, {
    variables: { id: classId },
    skip: !classId || !open,
    fetchPolicy: "network-only",
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    subject: "",
    period: "",
    gradeLevel: "",
    schoolName: "",
    district: "",
    payPeriodDefault: "",
    startingBalance: "",
    defaultCurrency: "CE$",
    isArchived: false,
  });

  // Populate form when data loads
  useEffect(() => {
    if (data?.class) {
      const c = data.class;
      setFormData({
        name: c.name || "",
        description: c.description || "",
        subject: c.subject || "",
        period: c.period || "",
        gradeLevel: c.gradeLevel?.toString() || "",
        schoolName: c.schoolName || "",
        district: c.district || "",
        payPeriodDefault: c.payPeriodDefault || "",
        startingBalance: c.startingBalance?.toString() || "",
        defaultCurrency: c.defaultCurrency || "CE$",
        isArchived: c.isArchived || false,
      });
    }
  }, [data]);

  const [updateClass, { loading: updateLoading }] = useMutation(UPDATE_CLASS, {
    onCompleted: () => {
      push({ title: "Success", description: "Class settings updated successfully" });
      onUpdated?.();
      refetch();
    },
    onError: (error) => {
      push({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const [rotateJoinCode, { loading: rotateLoading }] = useMutation(ROTATE_JOIN_CODE, {
    onCompleted: () => {
      push({ title: "Success", description: "Join code regenerated" });
      refetch();
    },
    onError: (error) => {
      push({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      push({ title: "Error", description: "Class name is required", variant: "destructive" });
      return;
    }

    const input: Record<string, unknown> = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      subject: formData.subject || null,
      period: formData.period.trim() || null,
      gradeLevel: formData.gradeLevel ? parseInt(formData.gradeLevel, 10) : null,
      schoolName: formData.schoolName.trim() || null,
      district: formData.district.trim() || null,
      payPeriodDefault: formData.payPeriodDefault || null,
      startingBalance: formData.startingBalance ? parseInt(formData.startingBalance, 10) : null,
      defaultCurrency: formData.defaultCurrency.trim() || "CE$",
      isArchived: formData.isArchived,
    };

    await updateClass({ variables: { id: classId, input } });
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isLoading = queryLoading || updateLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Class Settings</DialogTitle>
          <DialogDescription>
            Update your class configuration and preferences
          </DialogDescription>
        </DialogHeader>

        {queryLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g., Period 2 Economics"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Brief description of your class"
                    className="mt-1.5 resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(v) => update("subject", v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => update("period", e.target.value)}
                    placeholder='e.g., "2nd" or "Block A"'
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Grade Level</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(v) => update("gradeLevel", v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={String(g)}>
                          Grade {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* School Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                School Information
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => update("schoolName", e.target.value)}
                    placeholder="Your school name"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => update("district", e.target.value)}
                    placeholder="Your district"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Economy Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Economy Settings
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="defaultCurrency">Currency Symbol</Label>
                  <Input
                    id="defaultCurrency"
                    value={formData.defaultCurrency}
                    onChange={(e) => update("defaultCurrency", e.target.value)}
                    placeholder="CE$"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="startingBalance">Starting Balance</Label>
                  <Input
                    id="startingBalance"
                    type="number"
                    min="0"
                    value={formData.startingBalance}
                    onChange={(e) => update("startingBalance", e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    New students will start with this balance
                  </p>
                </div>

                <div>
                  <Label>Default Pay Period</Label>
                  <Select
                    value={formData.payPeriodDefault}
                    onValueChange={(v) => update("payPeriodDefault", v as PayPeriod)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select pay period" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAY_PERIODS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Join Code */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Join Code
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-mono text-lg font-bold">{data?.class?.joinCode}</p>
                  <p className="text-sm text-muted-foreground">
                    Students use this code to join your class
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => rotateJoinCode({ variables: { id: classId } })}
                  disabled={rotateLoading}
                >
                  {rotateLoading ? "Regenerating..." : "Regenerate Code"}
                </Button>
              </div>
            </div>

            {/* Archive Toggle */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Class Status
              </h3>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Archive Class</p>
                  <p className="text-sm text-muted-foreground">
                    Archived classes are hidden from students and won't appear in the main list
                  </p>
                </div>
                <Switch
                  checked={formData.isArchived}
                  onCheckedChange={(checked) => update("isArchived", checked)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {updateLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
