import { useQuery } from "@apollo/client/react";
import { GET_CLASSES } from "@/graphql/queries/classes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Classes() {
  const { data, loading, error, refetch } = useQuery(GET_CLASSES);

  if (loading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading classes…</div>
    );
  if (error)
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Failed to load classes: {error.message}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );

  const classes = data?.classes ?? [];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {classes.map((c: any) => (
        <Card key={c.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{c.name}</CardTitle>
            <CardDescription>
              {[c.term, c.room].filter(Boolean).join(" • ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Currency: {c.defaultCurrency}
            </div>
            <Button asChild size="sm">
              <Link to={`/classes/${c.id}`}>Open</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
