import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { STUDENT_DETAILS, STUDENT_TRANSACTIONS } from "@/graphql/queries/studentDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Package, History, Wallet } from "lucide-react";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import { formatClassMoney } from "@/lib/format";

export default function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const { currentClassId } = useCurrentClass();
  const navigate = useNavigate();

  const { data: studentData, loading: studentLoading, error: studentError } = useQuery(
    STUDENT_DETAILS,
    {
      variables: { studentId, classId: currentClassId },
      skip: !studentId || !currentClassId,
      fetchPolicy: "cache-and-network",
    }
  );

  const accountId = (studentData as any)?.account?.id;

  const { data: transactionData, loading: transactionLoading } = useQuery(
    STUDENT_TRANSACTIONS,
    {
      variables: { accountId },
      skip: !accountId,
      fetchPolicy: "cache-and-network",
    }
  );

  if (!currentClassId) {
    return (
      <div className="page-state">
        <p className="text-muted-foreground">Please select a class</p>
      </div>
    );
  }

  if (studentLoading) {
    return (
      <div className="page-state">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (studentError) {
    return (
      <div className="page-state text-destructive">
        <p>Failed to load student details</p>
        <p className="mt-2 text-sm">{studentError.message}</p>
      </div>
    );
  }

  const account = (studentData as any)?.account;
  const backpack = (studentData as any)?.studentBackpack || [];
  const purchaseHistory = (studentData as any)?.purchaseHistory || [];
  const transactions = (transactionData as any)?.transactionsByAccount || [];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const normalizedStatus = status.toLowerCase().replace(/_/g, "-");
    switch (normalizedStatus) {
      case "in-backpack":
        return "default";
      case "redeemed":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "DEPOSIT":
      case "PAYROLL":
        return "text-green-600";
      case "WITHDRAWAL":
      case "PURCHASE":
      case "FINE":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="page-title">Student Details</h1>
          <p className="page-subtitle !mt-0 max-w-prose md:text-base">
            View student's backpack, purchases, and transactions
          </p>
        </div>
        {account && (
          <Card className="w-full shrink-0 border bg-card lg:max-w-xs">
            <CardHeader className="pb-3 pt-5 sm:pt-6">
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{formatClassMoney(account.balance || 0)}</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      <Tabs defaultValue="backpack" className="flex flex-col gap-6">
        <TabsList>
          <TabsTrigger value="backpack">
            <Package className="mr-2 h-4 w-4" />
            Backpack
            <Badge className="ml-2" variant="secondary">{backpack.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <History className="mr-2 h-4 w-4" />
            Purchase History
            <Badge className="ml-2" variant="outline">{purchaseHistory.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Wallet className="mr-2 h-4 w-4" />
            Transactions
            <Badge className="ml-2" variant="outline">{transactions.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Backpack Tab */}
        <TabsContent value="backpack" className="flex flex-col gap-5 pt-2">
          {backpack.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Student's backpack is empty</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {backpack.map((purchase: any) => (
                <Card key={purchase.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {purchase.storeItem?.title || "(Deleted Item)"}
                      </CardTitle>
                      <Badge variant={getStatusVariant(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {purchase.storeItem?.imageUrl ? (
                      <img
                        src={purchase.storeItem.imageUrl}
                        alt={purchase.storeItem.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {purchase.storeItem?.description || "This item is no longer available"}
                    </p>
                    <div className="flex items-center justify-between text-sm tabular-nums">
                      <span>{purchase.quantity}x @ {formatClassMoney(purchase.unitPrice)}</span>
                      <span className="font-medium">{formatClassMoney(purchase.total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Purchased: {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Purchase History Tab */}
        <TabsContent value="purchases" className="flex flex-col gap-5 pt-2">
          {purchaseHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <History className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No purchase history</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseHistory.map((purchase: any) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.storeItem?.title || "(Deleted Item)"}
                      </TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell className="tabular-nums">{formatClassMoney(purchase.unitPrice)}</TableCell>
                      <TableCell className="font-medium tabular-nums">{formatClassMoney(purchase.total)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="flex flex-col gap-5 pt-2">
          {transactionLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Wallet className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No transactions</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {transaction.memo || "—"}
                      </TableCell>
                      <TableCell className={`text-right font-medium tabular-nums ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.amount > 0 ? "+" : ""}
                        {formatClassMoney(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
