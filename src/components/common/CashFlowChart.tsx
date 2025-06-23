"use client";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DataPoint {
  date: string;
  receivables: number;
  payables: number;
  net: number;
}

interface Props {
  data: DataPoint[];
}

export function CashFlowChart({ data }: Props) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='date' />
        <YAxis tickFormatter={value => `${formatCurrency(value.toLocaleString())}`} />
        <Tooltip
          formatter={(value, name) => [`${formatCurrency(Number(value))}`, name]}
        />
        <Legend />
        <Bar dataKey='receivables' fill='#4ade8a' name='Expected Inflows' />
        <Bar dataKey='payables' fill='#f87171' name='Expected Outflows' />
        <Bar dataKey='net' fill='#60a5fa' name='Net Forecast' />
      </BarChart>
    </ResponsiveContainer>
  );
}
