import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { REASONS_BY_CLASS } from "@/graphql/queries/reasons";
import { PAY_REQUESTS_BY_STUDENT } from "@/graphql/queries/requests";
import { CREATE_PAY_REQUEST } from "@/graphql/mutations/payRequests";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function StudentRequestForm({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  const { data: reasonsData, loading: reasonsLoading } = useQuery(
    REASONS_BY_CLASS,
    { variables: { classId } }
  );
  const [reason, setReason] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [justification, setJustification] = useState<string>("");

  const [createReq, { loading }] = useMutation(CREATE_PAY_REQUEST, {
    onCompleted: () => {
      toast({ title: "Request submitted" });
      setAmount("");
      setJustification("");
      setReason("");
    },
    onError: (e) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
    refetchQueries: [
      { query: PAY_REQUESTS_BY_STUDENT, variables: { classId, studentId } },
    ],
  });

  const reasons = reasonsData?.reasonsByClass ?? [];

  const submit = () => {
    const amt = Number(amount);
    if (!reason || !amt || amt <= 0 || !justification.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    createReq({
      variables: {
        input: { classId, studentId, amount: amt, reason, justification },
      },
    });
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Request a one-time payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Reason</Label>
          <Select
            value={reason}
            onValueChange={setReason}
            disabled={reasonsLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={reasonsLoading ? "Loading…" : "Select a reason"}
              />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((r: any) => (
                <SelectItem key={r.id} value={r.label}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Amount</Label>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Justification</Label>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain why you’re requesting this payment…"
          />
        </div>

        <div className="flex gap-2">
          <Button disabled={loading}>
            {loading ? "Submitting…" : "Submit request"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setReason("");
              setAmount("");
              setJustification("");
            }}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
