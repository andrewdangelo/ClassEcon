import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@apollo/client/react";
import { ACCOUNT, TRANSACTIONS_BY_ACCOUNT } from "@/graphql/queries/accounts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import * as React from "react";
import { format } from "date-fns";

interface BalanceOverTimeChartProps {
  studentId: string;
  classId: string;
  currentBalance: number;
  defaultCurrency?: string;
}

export default function BalanceOverTimeChart({ 
  studentId,
  classId, 
  currentBalance,
  defaultCurrency = "CE$"
}: BalanceOverTimeChartProps) {
  // First, get the account ID
  const { data: accountData } = useQuery(ACCOUNT, {
    variables: { studentId, classId },
    skip: !studentId || !classId,
    fetchPolicy: "cache-and-network",
  });

  const accountId = (accountData as any)?.account?.id;

  // Then fetch transactions
  const { data, loading } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
    variables: { accountId },
    skip: !accountId,
    fetchPolicy: "cache-and-network",
  });

  const transactions = React.useMemo(() => {
    const txns = (data as any)?.transactionsByAccount || [];
    // Sort by date ascending
    return [...txns].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [data]);

  // Calculate balance over time
  const balanceHistory = React.useMemo(() => {
    let runningBalance = 0;
    const history: Array<{ date: Date; balance: number }> = [];

    transactions.forEach((txn: any) => {
      runningBalance += txn.amount;
      history.push({
        date: new Date(txn.createdAt),
        balance: runningBalance
      });
    });

    return history;
  }, [transactions]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (balanceHistory.length === 0) {
      return {
        highestBalance: currentBalance,
        lowestBalance: currentBalance,
        startBalance: 0,
        change: currentBalance,
        changePercent: 0
      };
    }

    const balances = balanceHistory.map(h => h.balance);
    const highestBalance = Math.max(...balances, currentBalance);
    const lowestBalance = Math.min(...balances, 0);
    const startBalance = 0;
    const change = currentBalance - startBalance;
    const changePercent = startBalance === 0 ? 100 : ((change / startBalance) * 100);

    return {
      highestBalance,
      lowestBalance,
      startBalance,
      change,
      changePercent
    };
  }, [balanceHistory, currentBalance]);

  // SVG Chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxBalance = stats.highestBalance > 0 ? stats.highestBalance * 1.1 : 100;
  const minBalance = stats.lowestBalance < 0 ? stats.lowestBalance * 1.1 : 0;
  const balanceRange = maxBalance - minBalance;

  const getX = (index: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    return (index / (total - 1)) * chartWidth;
  };

  const getY = (balance: number) => {
    const normalized = (balance - minBalance) / balanceRange;
    return chartHeight - (normalized * chartHeight);
  };

  // Generate path
  const linePath = React.useMemo(() => {
    if (balanceHistory.length === 0) return "";
    
    const points = balanceHistory.map((point, index) => {
      const x = getX(index, balanceHistory.length);
      const y = getY(point.balance);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    return points;
  }, [balanceHistory]);

  // Generate area path (fill under line)
  const areaPath = React.useMemo(() => {
    if (balanceHistory.length === 0) return "";
    
    const points = balanceHistory.map((point, index) => {
      const x = getX(index, balanceHistory.length);
      const y = getY(point.balance);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const lastX = getX(balanceHistory.length - 1, balanceHistory.length);
    const bottomY = getY(Math.max(0, minBalance));
    
    return `${points} L ${lastX},${bottomY} L 0,${bottomY} Z`;
  }, [balanceHistory]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Balance Over Time
            </CardTitle>
            <CardDescription>Track your balance history</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {defaultCurrency} {currentBalance.toFixed(2)}
            </div>
            {stats.change !== 0 && (
              <div className={`text-sm flex items-center justify-end gap-1 ${stats.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {stats.change > 0 ? '+' : ''}{defaultCurrency} {stats.change.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] bg-muted animate-pulse rounded"></div>
        ) : balanceHistory.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transaction history yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <div className="w-full overflow-x-auto">
              <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-auto"
                style={{ minHeight: '200px' }}
              >
                {/* Grid lines */}
                <g>
                  {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                    const y = padding.top + (chartHeight * fraction);
                    const balance = maxBalance - (fraction * balanceRange);
                    return (
                      <g key={i}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={padding.left + chartWidth}
                          y2={y}
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="currentColor"
                          opacity="0.5"
                        >
                          {balance.toFixed(0)}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Zero line if applicable */}
                {minBalance < 0 && (
                  <line
                    x1={padding.left}
                    y1={padding.top + getY(0)}
                    x2={padding.left + chartWidth}
                    y2={padding.top + getY(0)}
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                )}

                {/* Area fill */}
                <g transform={`translate(${padding.left}, ${padding.top})`}>
                  <path
                    d={areaPath}
                    fill="currentColor"
                    opacity="0.1"
                    className="text-primary"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  />
                  
                  {/* Data points */}
                  {balanceHistory.map((point, index) => (
                    <circle
                      key={index}
                      cx={getX(index, balanceHistory.length)}
                      cy={getY(point.balance)}
                      r="3"
                      fill="currentColor"
                      className="text-primary"
                    />
                  ))}
                </g>
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Highest</div>
                <div className="font-semibold text-green-600">
                  {defaultCurrency} {stats.highestBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Lowest</div>
                <div className="font-semibold text-red-600">
                  {defaultCurrency} {stats.lowestBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Activity</div>
                <div className="font-semibold">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
