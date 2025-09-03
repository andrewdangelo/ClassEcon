import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClassContext } from "@/context/ClassContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Classes() {
  const { classes, currentClassId, setCurrentClassId, role } =
    useClassContext();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Classes</h2>
        {role === "TEACHER" && (
          <Link to="/classes/new">
            <Button>New Class</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((c) => {
          const active = c.id === currentClassId;
          return (
            <Link
              key={c.id}
              to={`/classes/${c.id}`}
              onClick={() => setCurrentClassId(c.id)}
            >
              <Card
                className={cn(
                  "hover:shadow-md transition",
                  active && "border-primary"
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{c.name}</CardTitle>
                  {active && (
                    <span className="rounded-md border px-2 py-1 text-xs">
                      Active
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  Term: {c.term ?? "—"} • Room: {c.room ?? "—"} • Currency:{" "}
                  {c.defaultCurrency ?? "CE$"}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
