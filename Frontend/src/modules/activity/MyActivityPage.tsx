import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@apollo/client/react";
import { ACCOUNT, TRANSACTIONS_BY_ACCOUNT } from "@/graphql/queries/accounts";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Wallet,
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Calendar
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import * as React from "react";
import { useCurrentClass } from "@/hooks/useCurrentClass";
import { useAppSelector } from "@/redux/store/store";
import { selectUser } from "@/redux/authSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BalanceOverTimeChart from "@/components/activity/BalanceOverTimeChart";

const TRANSACTION_CONFIG = {
  DEPOSIT: { 
    icon: TrendingUp, 
    color: "text-green-600 dark:text-green-400", 
    bgColor: "bg-green-50 dark:bg-green-950",
    label: "Deposit" 
  },
  INCOME: { 
    icon: DollarSign, 
    color: "text-green-600 dark:text-green-400", 
    bgColor: "bg-green-50 dark:bg-green-950",
    label: "Income" 
  },
  PAYROLL: { 
    icon: Wallet, 
    color: "text-blue-600 dark:text-blue-400", 
    bgColor: "bg-blue-50 dark:bg-blue-950",
    label: "Payroll" 
  },
  REFUND: { 
    icon: RefreshCw, 
    color: "text-cyan-600 dark:text-cyan-400", 
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    label: "Refund" 
  },
  PURCHASE: { 
    icon: ShoppingBag, 
    color: "text-purple-600 dark:text-purple-400", 
    bgColor: "bg-purple-50 dark:bg-purple-950",
    label: "Purchase" 
  },
  FINE: { 
    icon: AlertTriangle, 
    color: "text-yellow-600 dark:text-yellow-400", 
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    label: "Fine" 
  },
  WITHDRAWAL: { 
    icon: TrendingDown, 
    color: "text-red-600 dark:text-red-400", 
    bgColor: "bg-red-50 dark:bg-red-950",
    label: "Withdrawal" 
  },
  EXPENSE: { 
    icon: TrendingDown, 
    color: "text-red-600 dark:text-red-400", 
    bgColor: "bg-red-50 dark:bg-red-950",
    label: "Expense" 
  },
  TRANSFER: { 
    icon: ArrowLeftRight, 
    color: "text-gray-600 dark:text-gray-400", 
    bgColor: "bg-gray-50 dark:bg-gray-950",
    label: "Transfer" 
  },
  ADJUSTMENT: { 
    icon: RefreshCw, 
    color: "text-gray-600 dark:text-gray-400", 
    bgColor: "bg-gray-50 dark:bg-gray-950",
    label: "Adjustment" 
  },
};

export default function MyActivityPage() {
  const { currentClassId, current } = useCurrentClass();
  const user = useAppSelector(selectUser);
  const [filter, setFilter] = React.useState<string>("all");
  const [dateRange, setDateRange] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // First, get the account ID
  const { data: accountData } = useQuery(ACCOUNT, {
    variables: { 
      studentId: user?.id || "",
      classId: currentClassId || ""
    },
    skip: !user?.id || !currentClassId,
    fetchPolicy: "cache-and-network",
  });

  const accountId = (accountData as any)?.account?.id;
  
  // Then fetch transactions
  const { data, loading, error } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
    variables: { accountId },
    skip: !accountId,
    fetchPolicy: "cache-and-network",
  });

  const allTransactions = React.useMemo(() => {
    const txns = (data as any)?.transactionsByAccount || [];
    // Sort by date descending (newest first)
    return [...txns].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  // Apply filters
  const filteredTransactions = React.useMemo(() => {
    let filtered = allTransactions;

    // Filter by type
    if (filter !== "all") {
      filtered = filtered.filter((t: any) => t.type === filter);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      let interval: { start: Date; end: Date } | null = null;

      switch (dateRange) {
        case "this-month":
          interval = { start: startOfMonth(now), end: endOfMonth(now) };
          break;
        case "last-month":
          const lastMonth = subMonths(now, 1);
          interval = { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
          break;
        case "last-3-months":
          interval = { start: subMonths(now, 3), end: now };
          break;
      }

      if (interval) {
        filtered = filtered.filter((t: any) => 
          isWithinInterval(new Date(t.createdAt), interval!)
        );
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t: any) => 
        t.memo?.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allTransactions, filter, dateRange, searchQuery]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const income = filteredTransactions
      .filter((t: any) => t.amount > 0)
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter((t: any) => t.amount < 0)
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    const netChange = income - expenses;

    // Count by type
    const byType: Record<string, number> = {};
    filteredTransactions.forEach((t: any) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
    });

    return { income, expenses, netChange, byType };
  }, [filteredTransactions]);

  const getTransactionConfig = (type: string) => {
    return TRANSACTION_CONFIG[type as keyof typeof TRANSACTION_CONFIG] || TRANSACTION_CONFIG.ADJUSTMENT;
  };

  const defaultCurrency = current?.defaultCurrency || "CE$";

  // Get current balance
  const currentBalance = allTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);

  const handleExport = () => {
    // Create CSV content
    const headers = ["Date", "Type", "Amount", "Memo"];
    const rows = filteredTransactions.map((t: any) => [
      format(new Date(t.createdAt), "yyyy-MM-dd HH:mm:ss"),
      t.type,
      t.amount.toFixed(2),
      t.memo || ""
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentClassId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class to view your activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Activity</h1>
        <p className="text-muted-foreground">
          View your complete transaction history
        </p>
      </div>

      {/* Balance Chart */}
      <BalanceOverTimeChart 
        studentId={user?.id || ""}
        classId={currentClassId || ""}
        currentBalance={currentBalance}
        defaultCurrency={defaultCurrency}
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{defaultCurrency} {stats.income.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{defaultCurrency} {stats.expenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netChange >= 0 ? '+' : ''}{defaultCurrency} {stats.netChange.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Refine your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposits</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="PAYROLL">Payroll</SelectItem>
                  <SelectItem value="PURCHASE">Purchases</SelectItem>
                  <SelectItem value="FINE">Fines</SelectItem>
                  <SelectItem value="REFUND">Refunds</SelectItem>
                  <SelectItem value="EXPENSE">Expenses</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                  <SelectItem value="TRANSFER">Transfers</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {allTransactions.length} transactions
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredTransactions.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>All your financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">Failed to load transactions</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No transactions found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction: any) => {
                const config = getTransactionConfig(transaction.type);
                const Icon = config.icon;
                const isPositive = transaction.amount > 0;

                return (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between text-sm p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{defaultCurrency} {Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        {transaction.memo && (
                          <div className="text-sm font-medium mb-1">
                            {transaction.memo}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(transaction.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
