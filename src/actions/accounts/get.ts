"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Account, AccountTransactions } from "@/types";
import { headers } from "next/headers";

export async function getUserAccounts(): Promise<Account[]> {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const userId = session?.user.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.member.findFirst({
    where: { userId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.organizationId) throw new Error("User businessId not found");

  const businessId = user.organizationId;

  const accounts = await prisma.financialAccount.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  //console.log("accounts", JSON.stringify(accounts, null, 2));

  return accounts;
}

export async function getAccountWithTransactions(
  accountId: string
): Promise<AccountTransactions | null> {
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

  const businessId = user.organizationId;

  const account = await prisma.financialAccount.findUnique({
    where: {
      id: accountId,
      businessId,
    },
    include: {
      transactions: {
        include: {
          transaction: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  //console.log("============ acount with transactions===========");
  //console.log(JSON.stringify(account, null, 2));

  return account;
}
