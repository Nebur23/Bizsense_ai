"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Account, Transaction } from "@/types";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

// Match the component props to the schema structure and TypeScript types
export function RecentTransactions({
  accounts,
  transactions,
}: {
  accounts: Account[];
  transactions: Transaction[];
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find(a => a.isDefault)?.id || accounts[0]?.id
  );

  // Filter transactions for selected account based on accountTransactions relation
  const accountTransactions = useMemo(() => {
    if (!selectedAccountId) return [];
    return transactions.filter(t =>
      t.accountTransactions?.some(at => at.accountId === selectedAccountId)
    );
  }, [transactions, selectedAccountId]);

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      // Check for expense-type transactions based on your schema
      [
        "EXPENSE",
        "PURCHASE",
        "UTILITY_PAYMENT",
        "SALARY_PAYMENT",
        "LOAN_REPAYMENT",
        "SUBSCRIPTION_PAYMENT",
        "INVESTMENT_OUTFLOW ",
        "TAX_PAYMENT  ",
        "COMMISSION",
        "MAINTENANCE_EXPENSE",
        "INSURANCE_PAYMENT ",
        "REIMBURSEMENT",
        "PENALTY_OR_FINE",
        "DEPRECIATION",
      ].includes(t.type as string) &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Helper function to get transaction amount for the selected account
  const getTransactionAmountForAccount = (transaction: Transaction) => {
    const accountTransaction = transaction.accountTransactions?.find(
      at => at.accountId === selectedAccountId
    );
    return accountTransaction ? accountTransaction.amount : 0;
  };

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce<
    Record<string, number>
  >((acc, transaction) => {
    // Use the category name if available, otherwise use transaction type
    const categoryName =
      transaction.category?.name || (transaction.type as string);

    console.log("Transaction Category:", transaction.category?.name);

    console.log("Transaction type:", transaction.type);

    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += getTransactionAmountForAccount(transaction);
    return acc;
  }, {});

  // Format data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  // Find the selected account for currency display
  //const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  //const currency = selectedAccount?.currency || "XAF";

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Recent Transactions Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-base font-semibold'>
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Select account' />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentTransactions.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>
                No recent transactions
              </p>
            ) : (
              recentTransactions.map(transaction => {
                const amount = getTransactionAmountForAccount(transaction);
                // Determine if this is an income or expense transaction
                const isIncome = [
                  "SALE",
                  "LOAN_DISBURSEMENT",
                  "INVESTMENT_INFLOW",
                  "GRANT_RECEIPT",
                  "REFUND",
                  "REFUND",
                ].includes(transaction.type as string);

                return (
                  <div
                    key={transaction.id}
                    className='flex items-center justify-between'
                  >
                    <div className='space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-md'>
                      <div
                        className={cn(
                          "flex items-center",
                          isIncome ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {isIncome ? (
                          <ArrowUpRight className='mr-1 h-4 w-4' />
                        ) : (
                          <ArrowDownRight className='mr-1 h-4 w-4' />
                        )}
                        {formatCurrency(amount)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base font-normal'>
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0 pb-5'>
          {pieChartData.length === 0 ? (
            <p className='text-center text-muted-foreground py-4'>
              No expenses this month
            </p>
          ) : (
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    label={({ value }) => `${formatCurrency(value.toFixed(2))}`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value => `${formatCurrency(Number(value))}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
