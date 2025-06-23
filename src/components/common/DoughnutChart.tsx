"use client";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useState, useEffect } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

// Define professional color palette suitable for dashboard visualization
const generateColors = (count: number | undefined) => {
  // If count is undefined, return empty array
  if (count === undefined || count === 0) return [];

  // Professional color palette - these are carefully selected dashboard colors
  // with good contrast that work well together
  const baseColors = [
    "#2563eb", // blue
    "#0891b2", // cyan
    "#7c3aed", // violet
    "#0d9488", // teal
    "#4f46e5", // indigo
    "#0369a1", // sky blue
    "#4338ca", // indigo darker
    "#0e7490", // cyan darker
    "#1d4ed8", // blue darker
    "#5b21b6", // purple
    "#1e40af", // royal blue
    "#047857", // emerald
    "#6d28d9", // purple lighter
    "#0f766e", // teal darker
    "#3730a3", // indigo deepest
  ];

  // If we have fewer or equal accounts than base colors, return subset
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // For more accounts than colors, cycle through with slight variations
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// Define Account type
interface Account {
  name: string;
  balance: number;
}

const DoughnutChart = ({ accounts }: { accounts: Account[] }) => {
  const [chartData, setChartData] = useState<ChartData<"doughnut"> | null>(
    null
  );

  useEffect(() => {
    if (!accounts || accounts.length === 0) {
      setChartData(null);
      return;
    }

    const accountNames = accounts.map(a => a.name);
    const balances = accounts.map(a => a.balance);

    // Generate one color per account
    const backgroundColor = generateColors(accounts.length);

    // Ensure we're creating the proper chart configuration
    setChartData({
      datasets: [
        {
          label: "Accounts",
          data: balances,
          backgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: backgroundColor.map(color => color + "99"),
        },
      ],
      labels: accountNames,
    });
  }, [accounts]);

  if (!chartData) return null;

  return (
    <div className='w-full'>
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "0%",
          plugins: {
            legend: {
              position: "right",
              display: true,
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 12,
                },
                color: "#64748b", // Slate-500 color for text
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: context => {
                  const value = context.raw as number;
                  const total = (context.dataset.data as number[]).reduce(
                    (sum, val) => sum + (val as number),
                    0
                  );
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

export default DoughnutChart;
