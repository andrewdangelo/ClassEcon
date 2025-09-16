// src/modules/classes/StudentOverview.tsx
import * as React from "react";
import { gql } from "@apollo/client";
import {useQuery } from "@apollo/client/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ACCOUNT_QUERY = gql`
  query StudentOverview_Account($studentId: ID!, $classId: ID!) {
    account(studentId: $studentId, classId: $classId) {
      id
      balance
      classId
    }
    class(id: $classId) {
      id
      defaultCurrency
    }
  }
`;

const TXNS_BY_ACCOUNT = gql`
  query StudentOverview_Txns($accountId: ID!) {
    transactionsByAccount(accountId: $accountId) {
      id
      type
      amount
      memo
      createdAt
    }
  }
`;

const STORE_ITEMS_BY_CLASS = gql`
  query StudentOverview_Store($classId: ID!) {
    storeItemsByClass(classId: $classId) {
      id
      title
      price
      active
      stock
    }
  }
`;

type Props = {
  klass: { id: string; defaultCurrency?: string | null };
  studentId: string;
};

export default function StudentOverview({ klass, studentId }: Props) {
  // 1) Load account + currency
  const {
    data: acctData,
    loading: acctLoading,
    error: acctError,
  } = useQuery(ACCOUNT_QUERY, {
    variables: { studentId, classId: klass.id },
    fetchPolicy: "cache-first",
  });

  const account = acctData?.account || null;
  const currency = acctData?.class?.defaultCurrency ?? "CE$";

  // 2) Load transactions when account id is known
  const {
    data: txData,
    loading: txLoading,
    error: txError,
  } = useQuery(TXNS_BY_ACCOUNT, {
    variables: { accountId: account?.id ?? "" },
    skip: !account?.id,
    fetchPolicy: "cache-first",
  });

  // 3) Store items (browse)
  const { data: storeData } = useQuery(STORE_ITEMS_BY_CLASS, {
    variables: { classId: klass.id },
    fetchPolicy: "cache-first",
  });

  if (acctLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading…</CardContent>
      </Card>
    );
  }
  if (acctError) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          {acctError.message}
        </CardContent>
      </Card>
    );
  }
  if (!account) {
    return (
      <Card>
        <CardContent className="p-6">No account found.</CardContent>
      </Card>
    );
  }

  const txns = txData?.transactionsByAccount ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>My Balance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-3xl font-semibold tabular-nums">
            {currency} {account.balance}
          </div>
          {txLoading && (
            <div className="mt-2 text-sm text-muted-foreground">
              Loading transactions…
            </div>
          )}
          {txError && (
            <div className="mt-2 text-sm text-red-600">{txError.message}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {txns.slice(0, 8).map((t: any) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{t.type}</div>
                  <div className="text-xs text-muted-foreground">{t.memo}</div>
                </div>
                <div className="text-sm tabular-nums">{t.amount}</div>
              </li>
            ))}
            {!txns.length && (
              <li className="px-4 py-4 text-sm text-muted-foreground">
                No transactions yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Class Store</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 p-4">
            {(storeData?.storeItemsByClass ?? []).map((i: any) => (
              <li key={i.id} className="border rounded-lg p-4">
                <div className="font-medium">{i.title}</div>
                <div className="text-sm text-muted-foreground">
                  Price: {i.price} • {i.active ? "Available" : "Inactive"}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
