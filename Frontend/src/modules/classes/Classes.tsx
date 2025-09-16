import { useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/queries/me";
import { GET_CLASSES_BY_USER } from "@/graphql/queries/classes";
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
  // 1) Get current user
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery(ME, {
    fetchPolicy: "cache-first",
  });

  const userId = meData?.me?.id as string | undefined;

  // 2) Get classes for that userId
  const { data, loading, error, refetch } = useQuery(GET_CLASSES_BY_USER, {
    variables: {
      userId: userId!, // required by schema
      // role: "TEACHER",        // optional: uncomment to filter by role
      includeArchived: false, // set true to include archived classes
    },
    skip: !userId, // wait until we know the userId
    fetchPolicy: "cache-and-network",
  });

  // Loading states (ME or classes)
  if (meLoading || (!userId && loading)) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading classes…</div>
    );
  }

  // Error states
  if (meError) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Failed to load user: {meError.message}
        </p>
      </div>
    );
  }

  if (error) {
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
  }

  const classes = data?.classesByUser ?? [];
  if (classes.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No classes for your account yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {classes.map((c: any) => (
        <Card key={c.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {c.name}
              {c.isArchived && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Archived
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {[c.period, c.subject].filter(Boolean).join(" • ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Currency: {c.defaultCurrency}
            </div>
            <Button asChild size="sm" disabled={!!c.isArchived}>
              <Link to={`/classes/${c.id}`}>Open</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
