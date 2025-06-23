"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
} as const;

type DateRangeKey = keyof typeof DATE_RANGES;

export function AccountChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [dateRange, setDateRange] = useState<DateRangeKey>("1M");
  //const [currency, setCurrency] = useState<string>("XAF"); // Set default currency based on your data

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      t => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    // Group transactions by date
    const grouped = filtered.reduce<
      Record<string, { date: string; income: number; expense: number }>
    >((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      // Map transaction types according to your schema
      if (transaction.type === "SALE" || transaction.type === "REFUND") {
        acc[date].income += transaction.amount;
      } else if (
        transaction.type === "EXPENSE" ||
        transaction.type === "PURCHASE"
      ) {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions, dateRange]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-7'>
        <CardTitle className='text-base font-normal'>
          Transaction Overview
        </CardTitle>
        <Select
          defaultValue={dateRange}
          onValueChange={value => setDateRange(value as DateRangeKey)}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Select range' />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className='flex justify-around mb-6 text-sm'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Total Income</p>
            <p className='text-lg font-bold text-green-500'>
              {formatCurrency(totals.income)}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-muted-foreground'>Total Expenses</p>
            <p className='text-lg font-bold text-red-500'>
              {formatCurrency(totals.expense)}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-muted-foreground'>Net</p>
            <p
              className={`text-lg font-bold ${
                totals.income - totals.expense >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatCurrency(totals.income - totals.expense)}
            </p>
          </div>
        </div>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='date'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => formatCurrency(value)}
              />
              <Tooltip
                formatter={value => [
                  formatCurrency(value as number),
                  undefined,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar
                dataKey='income'
                name='Income'
                fill='#22c55e'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='expense'
                name='Expense'
                fill='#ef4444'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
