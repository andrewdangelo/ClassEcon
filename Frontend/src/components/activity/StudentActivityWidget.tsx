import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@apollo/client/react";
import { ACCOUNT, TRANSACTIONS_BY_ACCOUNT } from "@/graphql/queries/accounts";
import { 
  DollarSign, 
  Clock, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Wallet,
  ArrowLeftRight
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentActivityWidgetProps {
  studentId: string;
  classId: string;
  defaultCurrency?: string;
}

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

export default function StudentActivityWidget({ 
  studentId, 
  classId,
  defaultCurrency = "CE$"
}: StudentActivityWidgetProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState<string>("all");

  // First, get the account ID
  const { data: accountData } = useQuery(ACCOUNT, {
    variables: { studentId, classId },
    skip: !studentId || !classId,
    fetchPolicy: "cache-and-network",
  });

  const accountId = (accountData as any)?.account?.id;

  // Then fetch transactions
  const { data, loading, error } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
    variables: { accountId },
    skip: !accountId,
    fetchPolicy: "cache-and-network",
  });

  if (!studentId || !classId) {
    return null;
  }

  const allTransactions = (data as any)?.transactionsByAccount || [];
  
  // Filter transactions
  const filteredTransactions = filter === "all" 
    ? allTransactions 
    : allTransactions.filter((t: any) => t.type === filter);
  
  // Get recent transactions (top 5)
  const recentTransactions = filteredTransactions.slice(0, 5);

  // Calculate statistics
  const totalIncome = allTransactions
    .filter((t: any) => t.amount > 0)
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalExpenses = allTransactions
    .filter((t: any) => t.amount < 0)
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  const handleViewAll = () => {
    navigate(`/classes/${classId}/activity`);
  };

  const getTransactionConfig = (type: string) => {
    return TRANSACTION_CONFIG[type as keyof typeof TRANSACTION_CONFIG] || TRANSACTION_CONFIG.ADJUSTMENT;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              My Activity
            </CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter type" />
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
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">Failed to load activity data</div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Total Income</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {defaultCurrency} {totalIncome.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3" />
                  <span>Total Expenses</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {defaultCurrency} {totalExpenses.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Recent Activity
                  {filter !== "all" && ` (${TRANSACTION_CONFIG[filter as keyof typeof TRANSACTION_CONFIG]?.label || filter})`}
                </div>
                <div className="space-y-2">
                  {recentTransactions.map((transaction: any) => {
                    const config = getTransactionConfig(transaction.type);
                    const Icon = config.icon;
                    const isPositive = transaction.amount > 0;

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-start justify-between text-sm p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                            </div>
                            {transaction.memo && (
                              <div className="text-xs font-medium mb-1 truncate">
                                {transaction.memo}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(transaction.createdAt), "MMM d, h:mm a")}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold text-sm ml-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{defaultCurrency} {Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">
                  {filter !== "all" ? "No transactions of this type" : "Start earning and spending to see your activity"}
                </p>
              </div>
            )}

            {/* View All Button */}
            {filteredTransactions.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleViewAll} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View All {allTransactions.length} Transaction{allTransactions.length !== 1 ? "s" : ""}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
