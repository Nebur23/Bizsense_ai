"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Transaction } from "@/types";
import { headers } from "next/headers";

export async function getDashboardData(): Promise<Transaction[]> {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const userId = session?.user.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.member.findFirst({
    where: { userId: userId },
  });

  if (!user) throw new Error("User not found");

  if (!user.organizationId) throw new Error("No business found for this user");

  const businessId = user.organizationId;

  // Get all user transactions
  const transactions = await prisma.transaction.findMany({
    where: { businessId },
    include: {
      accountTransactions: {
        include: {
          account: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return transactions;
}
