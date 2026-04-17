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
import { ClassesByUserQuery, MeQuery } from "@/graphql/__generated__/graphql";
import { Plus, GraduationCap } from "lucide-react";

export default function Classes() {
  // 1) Get current user
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<MeQuery>(ME, {
    fetchPolicy: "cache-first",
  });

  const userId = meData?.me?.id;

  // 2) Get classes for that userId
  const { data, loading, error, refetch } = useQuery<ClassesByUserQuery>(GET_CLASSES_BY_USER, {
    variables: {
      userId: userId!, // required by schema
      // role: "TEACHER",        // optional: uncomment to filter by role
      includeArchived: false, // set true to include archived classes
    },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  // Loading states (ME or classes)
  if (meLoading || (!userId && loading)) {
    return (
      <div className="py-10 text-sm text-muted-foreground">
        Fetching your classes and enrollment…
      </div>
    );
  }

  // Error states
  if (meError) {
    return (
      <div className="py-6">
        <p className="text-sm text-destructive">
          Failed to load user: {meError.message}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
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
  console.log(data)

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="page-title">Classes</h1>
          <p className="page-subtitle">
            Manage your classroom economies
          </p>
        </div>
        <Button asChild>
          <Link to="/classes/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Link>
        </Button>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              No Classes Yet
            </CardTitle>
            <CardDescription>
              Create your first classroom economy to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/classes/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Class
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  );
}
