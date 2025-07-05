"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function prepareCashFlowSequence(): Promise<number[][]> {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const userId = session?.user.id;

  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.member.findFirst({
    where: { userId: userId },
  });

  if (!user) throw new Error("User not found");

  if (!user.organizationId) throw new Error("User businessId not found");

  // if (!["user", "ADMIN"].includes(user.role)) {
  //   throw new Error(
  //     "Unauthorized: Insufficient permissions to create accounts"
  //   );
  // }

  const businessId = user.organizationId;
  const transactions = await prisma.transaction.findMany({
    where: {
      businessId,
      type: {
        in: ["SALE", "EXPENSE"],
      },
    },
    orderBy: {
      date: "asc",
    },
    select: {
      date: true,
      amount: true,
      type: true,
    },
  });

  // Group by day
  const dailyData: Record<string, { cashIn: number; cashOut: number }> = {};

  transactions.forEach(t => {
    const dateStr = t.date.toISOString().split("T")[0];
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { cashIn: 0, cashOut: 0 };
    }

    if (t.type === "SALE") {
      dailyData[dateStr].cashIn += t.amount;
    } else {
      dailyData[dateStr].cashOut += Math.abs(t.amount);
    }
  });

  // Convert to array
  const sortedDates = Object.keys(dailyData).sort();
  const cashInSeries = sortedDates.map(date => dailyData[date].cashIn);
  const cashOutSeries = sortedDates.map(date => dailyData[date].cashOut);

  // Generate lagged features
  const sequences = [];
  for (let i = 6; i < cashInSeries.length; i++) {
    sequences.push([
      cashInSeries[i], // current cash_in
      cashOutSeries[i], // current cash_out
      cashInSeries[i - 1], // cash_in_lag1
      cashOutSeries[i - 1], // cash_out_lag1
      sumLastN(cashInSeries, i - 6, i + 1), // rolling_cash_in_7d
      sumLastN(cashOutSeries, i - 6, i + 1), // rolling_cash_out_7d
    ]);
  }

  return sequences;
}

function sumLastN(arr: number[], start: number, end: number): number {
  return arr.slice(start, end).reduce((acc, val) => acc + val, 0);
}

export async function getCashInSeries(): Promise<
  { date: string; cashIn: number }[]
> {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const userId = session?.user.id;

  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.member.findFirst({
    where: { userId: userId },
  });

  if (!user) throw new Error("User not found");

  if (!user.organizationId) throw new Error("User businessId not found");

  // if (!["user", "ADMIN"].includes(user.role)) {
  //   throw new Error(
  //     "Unauthorized: Insufficient permissions to create accounts"
  //   );
  // }

  const businessId = user.organizationId;
  const transactions = await prisma.transaction.findMany({
    where: {
      businessId,
      type: "SALE",
    },
    orderBy: {
      date: "asc",
    },
  });

  const daily: Record<string, number> = {};

  transactions.forEach(t => {
    const dateStr = t.date.toISOString().split("T")[0];
    daily[dateStr] = (daily[dateStr] || 0) + t.amount;
  });

  return Object.entries(daily).map(([date, value]) => ({
    date,
    cashIn: value,
  }));
}
