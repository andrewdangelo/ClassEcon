import { useState, type Dispatch, type SetStateAction } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/toast";
import { UserPlus, Trash2 } from "lucide-react";

export const TEACHER_BY_EMAIL_FOR_CLASS = gql`
  query TeacherByEmailForClass($classId: ID!, $email: String!) {
    teacherByEmailForClass(classId: $classId, email: $email) {
      id
      name
      email
    }
  }
`;

export interface TeacherRow {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface CoTeachersPanelProps {
  classId: string;
  teacherRows: TeacherRow[];
  setTeacherRows: Dispatch<SetStateAction<TeacherRow[]>>;
  meId?: string;
  /** Distinct id when multiple panels exist on one page */
  emailInputId?: string;
  /** Shown under the section title */
  description?: string;
}

export function CoTeachersPanel({
  classId,
  teacherRows,
  setTeacherRows,
  meId,
  emailInputId = "coTeacherEmail",
  description = "Other teachers can manage this class with you. They must already have a teacher account.",
}: CoTeachersPanelProps) {
  const { push } = useToast();
  const [coTeacherEmail, setCoTeacherEmail] = useState("");

  const { refetch: refetchTeacherByEmail, loading: lookupLoading } = useQuery<{
    teacherByEmailForClass: TeacherRow;
  }>(TEACHER_BY_EMAIL_FOR_CLASS, {
    skip: true,
    variables: { classId, email: "" },
    fetchPolicy: "network-only",
  });

  const handleAddCoTeacher = async () => {
    const email = coTeacherEmail.trim();
    if (!email) {
      push({
        title: "Error",
        description: "Enter the teacher's email address",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await refetchTeacherByEmail({ classId, email });
      if (result.error) {
        throw new Error(result.error.message || "Lookup failed");
      }
      const found = result.data?.teacherByEmailForClass;
      if (!found?.id) {
        push({
          title: "Error",
          description: "Could not add co-teacher",
          variant: "destructive",
        });
        return;
      }
      if (teacherRows.some((r) => r.id === found.id)) {
        push({ title: "Already added", description: "That teacher is already on this class." });
        return;
      }
      setTeacherRows((prev) => [...prev, found]);
      setCoTeacherEmail("");
      push({
        title: "Added",
        description: `${found.name || found.email || "Teacher"} will be saved when you save.`,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Lookup failed";
      push({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const removeTeacherRow = (id: string) => {
    if (id === meId) {
      push({
        title: "Cannot remove yourself",
        description: "Ask another teacher to remove you, or contact support.",
        variant: "destructive",
      });
      return;
    }
    if (teacherRows.length <= 1) {
      push({
        title: "Error",
        description: "At least one teacher is required",
        variant: "destructive",
      });
      return;
    }
    setTeacherRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Co-teachers (optional)
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ul className="space-y-2 rounded-lg border divide-y">
        {teacherRows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
          >
            <div className="min-w-0">
              <span className="font-medium truncate block">
                {row.name?.trim() || "Teacher"}
                {row.id === meId ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                ) : null}
              </span>
              {row.email ? (
                <span className="text-xs text-muted-foreground truncate block">{row.email}</span>
              ) : null}
            </div>
            {row.id !== meId ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeTeacherRow(row.id)}
                aria-label={`Remove ${row.name || "teacher"}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">—</span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor={emailInputId}>Teacher email</Label>
          <Input
            id={emailInputId}
            type="email"
            value={coTeacherEmail}
            onChange={(e) => setCoTeacherEmail(e.target.value)}
            placeholder="colleague@school.edu"
            className="mt-1.5"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="sm:mb-0.5"
          onClick={() => void handleAddCoTeacher()}
          disabled={lookupLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {lookupLoading ? "Looking up…" : "Add co-teacher"}
        </Button>
      </div>
    </div>
  );
}
