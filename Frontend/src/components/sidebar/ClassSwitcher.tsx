import React from "react";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
import { ClassesByUserQuery } from "@/graphql/__generated__/graphql";
import { useClassContext } from "@/context/ClassContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import JoinClassModal from "@/components/classes/JoinClassModal";

type Props = {
  meId: string | undefined;
  className?: string;
};

export function ClassSwitcher({ meId, className }: Props) {
  const { currentClassId, setCurrentClassId } = useClassContext();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<ClassesByUserQuery>(
    GET_CLASSES_BY_USER,
    {
      variables: { userId: meId },
      fetchPolicy: "cache-and-network",
    }
  );

  const classes = data?.classesByUser ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClassId = e.target.value;
    setCurrentClassId(newClassId);
    navigate(`/classes/${newClassId}`);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Current class
        </label>
        <JoinClassModal 
          trigger={
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Plus className="h-3 w-3" />
            </Button>
          }
        />
      </div>
      <select
        value={currentClassId ?? ""}
        onChange={handleChange}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Select current class"
      >
        {loading && <option>Loading…</option>}
        {error && <option>Error loading classes</option>}
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.subject && c.period ? ` — ${c.subject} • Period ${c.period}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
