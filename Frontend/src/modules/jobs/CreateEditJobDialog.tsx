import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_JOB, UPDATE_JOB } from "../../graphql/mutations/jobs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";


interface CreateEditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  job?: any;
  onSuccess: () => void;
}

export function CreateEditJobDialog({
  open,
  onOpenChange,
  classId,
  job,
  onSuccess,
}: CreateEditJobDialogProps) {
  const isEditing = !!job;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rolesResponsibilities: "",
    salary: "",
    salaryUnit: "FIXED",
    period: "WEEKLY",
    maxCapacity: "1",
    active: true,
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        rolesResponsibilities: job.rolesResponsibilities || "",
        salary: job.salary.amount?.toString() || "",
        salaryUnit: job.salary.unit || "FIXED",
        period: job.period || "WEEKLY",
        maxCapacity: job.capacity.max?.toString() || "1",
        active: job.active ?? true,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        rolesResponsibilities: "",
        salary: "",
        salaryUnit: "FIXED",
        period: "WEEKLY",
        maxCapacity: "1",
        active: true,
      });
    }
  }, [job, open]);

  const [createJob, { loading: creating }] = useMutation(CREATE_JOB, {
    onCompleted: () => {
      onSuccess();
    },
  });

  const [updateJob, { loading: updating }] = useMutation(UPDATE_JOB, {
    onCompleted: () => {
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      title: formData.title,
      description: formData.description || undefined,
      rolesResponsibilities: formData.rolesResponsibilities || undefined,
      salary: parseInt(formData.salary),
      salaryUnit: formData.salaryUnit,
      period: formData.period,
      maxCapacity: parseInt(formData.maxCapacity),
      active: formData.active,
    };

    if (isEditing) {
      await updateJob({
        variables: {
          id: job.id,
          input,
        },
      });
    } else {
      await createJob({
        variables: {
          input: {
            ...input,
            classId,
          },
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Job" : "Create New Job"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the job details below"
              : "Fill in the details to create a new class job"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Line Leader, Paper Passer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of the job"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rolesResponsibilities">Roles & Responsibilities</Label>
            <Textarea
              id="rolesResponsibilities"
              value={formData.rolesResponsibilities}
              onChange={(e) =>
                setFormData({ ...formData, rolesResponsibilities: e.target.value })
              }
              placeholder="Detailed list of duties and expectations"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Amount *</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Pay Period *</Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Bi-Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="SEMESTER">Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Maximum Positions *</Label>
            <Input
              id="maxCapacity"
              type="number"
              min="1"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
              placeholder="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              How many students can hold this job simultaneously
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active (accepting applications)
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? "Saving..." : isEditing ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
