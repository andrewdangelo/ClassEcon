import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import {
  apiFetchStoreItemsByClass,
  apiFetchStudentsByClass,
  apiFetchTotalBalanceForClass,
} from "@/api/client";
import { useApi } from "@/hooks/useApi";
import * as React from "react";
import { useToast } from "@/components/ui/toast";

export default function Dashboard() {
  const { currentClassId, current } = useCurrentClass();
  const { push } = useToast();

  const balanceQuery = useApi(
    () =>
      currentClassId
        ? apiFetchTotalBalanceForClass(currentClassId)
        : Promise.resolve(0),
    [currentClassId]
  );
  const studentsQuery = useApi(
    () =>
      currentClassId
        ? apiFetchStudentsByClass(currentClassId)
        : Promise.resolve([]),
    [currentClassId]
  );
  const storeQuery = useApi(
    () =>
      currentClassId
        ? apiFetchStoreItemsByClass(currentClassId)
        : Promise.resolve([]),
    [currentClassId]
  );

  React.useEffect(() => {
    if (balanceQuery.error)
      push({
        title: "Failed to load balances",
        description: balanceQuery.error.message,
        variant: "destructive",
      });
    if (studentsQuery.error)
      push({
        title: "Failed to load students",
        description: studentsQuery.error.message,
        variant: "destructive",
      });
    if (storeQuery.error)
      push({
        title: "Failed to load store",
        description: storeQuery.error.message,
        variant: "destructive",
      });
  }, [balanceQuery.error, studentsQuery.error, storeQuery.error, push]);

  if (!currentClassId)
    return <div>Select a class from the sidebar to see dashboard stats.</div>;

  const totalBalance = balanceQuery.data ?? 0;
  const studentCount = (studentsQuery.data ?? []).length;
  const itemsInStock = (storeQuery.data ?? []).reduce(
    (n, it) => n + it.stock,
    0
  );

  const loading =
    balanceQuery.loading || studentsQuery.loading || storeQuery.loading;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {current?.name} {current?.term ? `· ${current.term}` : ""}
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
            <CardDescription>Total across students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "Loading..." : `CE$ ${totalBalance}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Enrolled in class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "Loading..." : studentCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Inventory</CardTitle>
            <CardDescription>Items in stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "Loading..." : itemsInStock}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
