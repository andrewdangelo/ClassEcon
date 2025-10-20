import * as React from "react";
import { useMutation } from "@apollo/client/react";
import { JOIN_CLASS } from "@/graphql/mutations/joinClass";
import { GET_CLASSES, GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
import { JoinClassMutation } from "@/graphql/__generated__/graphql";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/toast";
import { Plus, Loader2 } from "lucide-react";

interface JoinClassModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function JoinClassModal({ trigger, onSuccess }: JoinClassModalProps) {
  const [open, setOpen] = React.useState(false);
  const [joinCode, setJoinCode] = React.useState("");
  const { push } = useToast();
  const user = useAppSelector(selectUser);

  const [joinClass, { loading }] = useMutation<JoinClassMutation>(JOIN_CLASS, {
    onCompleted: (data) => {
      push({
        title: "Successfully joined class!",
        description: `You are now a member of ${data.joinClass.name}`,
      });
      setJoinCode("");
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      push({
        title: "Failed to join class",
        description: error.message,
        variant: "destructive",
      });
    },
    refetchQueries: [
      { query: GET_CLASSES },
      { 
        query: GET_CLASSES_BY_USER, 
        variables: { userId: user?.id, includeArchived: false } 
      }
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    
    if (!code) {
      push({
        title: "Invalid code",
        description: "Please enter a join code",
        variant: "destructive",
      });
      return;
    }

    joinClass({ variables: { joinCode: code } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Join Another Class
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Another Class</DialogTitle>
          <DialogDescription>
            Enter the join code provided by your teacher to join another class.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-code">Class Join Code</Label>
            <Input
              id="join-code"
              placeholder="e.g., ABC123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="font-mono text-lg text-center uppercase"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Join codes are 6-character codes provided by your teacher
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !joinCode.trim()} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Join Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
