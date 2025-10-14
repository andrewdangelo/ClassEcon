import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ISSUE_FINE } from "@/graphql/mutations/fines";
import { FINES_BY_CLASS } from "@/graphql/queries/fines";
import { STUDENTS_BY_CLASS } from "@/graphql/queries/students";
import { useToast } from "@/components/ui/toast";

interface StudentsByClassQuery {
  studentsByClass: Array<{
    id: string;
    name: string;
    balance: number;
  }>;
}

interface IssueFineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  preselectedStudentId?: string;
}

export function IssueFineDialog({
  open,
  onOpenChange,
  classId,
  preselectedStudentId,
}: IssueFineDialogProps) {
  const { push: toast } = useToast();
  const [studentId, setStudentId] = useState(preselectedStudentId || "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  // Fetch students in the class
  const { data: studentsData, loading: studentsLoading } = useQuery<StudentsByClassQuery>(
    STUDENTS_BY_CLASS,
    {
      variables: { classId },
      skip: !open,
    }
  );

  const [issueFine, { loading, error }] = useMutation(ISSUE_FINE, {
    refetchQueries: [
      { query: FINES_BY_CLASS, variables: { classId } },
      "Account",
      "TransactionsByAccount",
    ],
    onCompleted: () => {
      toast({
        title: "Fine Issued",
        description: "The fine has been successfully issued to the student.",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setStudentId(preselectedStudentId || "");
    setAmount("");
    setReason("");
    setDescription("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid fine amount",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the fine",
        variant: "destructive",
      });
      return;
    }

    await issueFine({
      variables: {
        input: {
          studentId,
          classId,
          amount: parseFloat(amount),
          reason: reason.trim(),
          description: description.trim() || undefined,
        },
      },
    });
  };

  const students = studentsData?.studentsByClass || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Issue Fine</DialogTitle>
            <DialogDescription>
              Issue a fine to a student. The amount will be deducted from their
              balance immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="student">Student *</Label>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Select
                  value={studentId}
                  onValueChange={setStudentId}
                  disabled={!!preselectedStudentId}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (CE$) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter fine amount"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason *</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Disrupting class"
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to the student
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional context or details..."
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing...
                </>
              ) : (
                "Issue Fine"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
