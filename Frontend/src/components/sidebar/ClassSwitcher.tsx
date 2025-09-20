import React from "react";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
import { ClassesByUserQuery } from "@/graphql/__generated__/graphql";
import { useClassContext } from "@/context/ClassContext";
import { cn } from "@/lib/utils";

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
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        Current class
      </label>
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
            {c.term ? ` — ${c.term}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
