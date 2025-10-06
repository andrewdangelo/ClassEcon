// src/modules/classes/TeacherOverview.tsx
import * as React from "react";
import { gql } from "@apollo/client";
import {useQuery } from "@apollo/client/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Copy, Share2 } from "lucide-react";

const TEACHER_OVERVIEW = gql`
  query TeacherOverview_Data($id: ID!) {
    class(id: $id) {
      id
      name
      slug
      defaultCurrency
      joinCode

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
  const { push } = useToast();
  
  const { data, loading, error } = useQuery(TEACHER_OVERVIEW, {
    variables: { id: klass.id },
    fetchPolicy: "cache-first",
  });

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      push({
        title: "Copied!",
        description: `${description} copied to clipboard`,
      });
    } catch (err) {
      push({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

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
    <div className="space-y-6">
      {/* Join Code Section */}
      {c.joinCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Class Join Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Share this code with students to join your class
                  </p>
                  <p className="font-mono text-lg font-bold">{c.joinCode}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(c.joinCode, "Join code")}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Code
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => copyToClipboard(
                      `Join my class "${c.name}" with code: ${c.joinCode}`,
                      "Invitation message"
                    )}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Overview Grid */}
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
    </div>
  );
}
