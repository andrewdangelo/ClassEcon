// src/modules/classes/TeacherOverview.tsx
import * as React from "react";
import { gql } from "@apollo/client";
import {useQuery } from "@apollo/client/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TEACHER_OVERVIEW = gql`
  query TeacherOverview_Data($id: ID!) {
    class(id: $id) {
      id
      name
      slug
      defaultCurrency

      students {
        id
        name
        balance
      }

      jobs {
        id
        title
        active
        salary {
          amount
          unit
        }
        period
        capacity {
          current
          max
        }
      }

      storeItems {
        id
        title
        price
        active
        stock
      }

      payRequests {
        id
        student {
          id
          name
        }
        amount
        reason
        status
        createdAt
      }
    }
  }
`;

type Props = {
  klass: {
    id: string;
    name: string;
    slug?: string | null;
    defaultCurrency?: string | null;
  };
};

export default function TeacherOverview({ klass }: Props) {
  const { data, loading, error } = useQuery(TEACHER_OVERVIEW, {
    variables: { id: klass.id },
    fetchPolicy: "cache-first",
  });

  if (loading)
    return (
      <Card>
        <CardContent className="p-6">Loading…</CardContent>
      </Card>
    );
  if (error)
    return (
      <Card>
        <CardContent className="p-6 text-red-600">{error.message}</CardContent>
      </Card>
    );

  const c = data?.class;
  if (!c) return null;

  const currency = c.defaultCurrency ?? "CE$";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2">
            {c.students.map((s: any) => (
              <li
                key={s.id}
                className="flex justify-between border rounded-md px-3 py-2"
              >
                <span>{s.name}</span>
                <span className="tabular-nums">
                  {currency} {s.balance}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2">
            {c.jobs.map((j: any) => (
              <li
                key={j.id}
                className="flex justify-between border rounded-md px-3 py-2"
              >
                <span>
                  {j.title} {j.active ? "" : "(inactive)"}
                </span>
                <span className="text-muted-foreground text-sm">
                  {j.salary.amount}/{j.period.toLowerCase()} •{" "}
                  {j.capacity.current}/{j.capacity.max}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2">
            {c.storeItems.map((i: any) => (
              <li
                key={i.id}
                className="flex justify-between border rounded-md px-3 py-2"
              >
                <span>
                  {i.title} {i.active ? "" : "(inactive)"}
                </span>
                <span className="text-muted-foreground text-sm">
                  Price: {i.price}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Pay Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2">
            {c.payRequests.slice(0, 8).map((r: any) => (
              <li
                key={r.id}
                className="flex justify-between border rounded-md px-3 py-2"
              >
                <span>
                  {r.student?.name ?? "Student"} • {r.reason}
                </span>
                <span className="text-muted-foreground text-sm">
                  {r.status} • {r.amount}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
