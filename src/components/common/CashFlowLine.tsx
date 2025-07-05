/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function CashFlowForecast() {
  const [forecast, setForecast] = useState<{
    date: string;
    forecast: number;
  } | null>(null);

  const [historicalData, setHistoricalData] = useState<
    Array<{ date: string; cashIn: number }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load historical data + prediction
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/predict/cash-flow/historical");
        if (!res.ok) throw new Error("Failed to load historical data");

        const historical = await res.json();
        setHistoricalData(historical.slice(-7)); // Get last 7 days

        const predRes = await fetch("/api/predict/cash-flow");
        if (!predRes.ok) throw new Error("Failed to get forecast");

        const prediction = await predRes.json();

        setForecast({
          date: getNextDay(),
          forecast: prediction.prediction,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load forecast data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function getNextDay(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  // Format data for Recharts
  const chartData = [...historicalData, ...(forecast ? [forecast] : [])];

  return (
    <div className='space-y-6'>
      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='cashIn'
                stroke='#48BB78'
                name='Historical'
              />
              {forecast && (
                <Line
                  type='monotone'
                  dataKey='forecast'
                  stroke='#3B82F6'
                  name='Forecast'
                  dot={true}
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Value */}
      {forecast && (
        <Card className='p-6 bg-blue-50 border-l-4 border-blue-500'>
          <h2 className='font-semibold mb-2'>AI Forecast</h2>
          <ul className='space-y-2'>
            <li className='flex justify-between font-medium'>
              <span>{forecast.date}</span>
              <span>{formatCurrency(forecast.forecast)} XAF</span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
