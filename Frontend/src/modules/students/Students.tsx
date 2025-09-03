import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import { useApi } from "@/hooks/useApi";
import { apiFetchStudentsByClass } from "@/api/client";
import * as React from "react";
import { useToast } from "@/components/ui/toast";

export default function Students() {
  const { currentClassId, current } = useCurrentClass();
  const { push } = useToast();
  const [q, setQ] = React.useState("");

  const query = useApi(
    () =>
      currentClassId
        ? apiFetchStudentsByClass(currentClassId)
        : Promise.resolve([]),
    [currentClassId]
  );

  React.useEffect(() => {
    if (query.error)
      push({
        title: "Failed to load students",
        description: query.error.message,
        variant: "destructive",
      });
  }, [query.error, push]);

  if (!currentClassId) return <div>Select a class to view students.</div>;

  const all = query.data ?? [];
  const filtered = all.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Students — {current?.name} {current?.term ? `· ${current.term}` : ""}
        </h2>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={query.loading ? "Loading..." : "Search students..."}
          className="max-w-sm"
          disabled={query.loading}
        />
      </div>

      {query.loading ? (
        <div className="text-sm text-muted-foreground">Loading students…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
              </CardHeader>
              <CardContent>Balance: CE$ {s.balance}</CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No students match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
