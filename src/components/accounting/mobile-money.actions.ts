"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getMobileMoneyAccounts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const user = await prisma.member.findFirst({
    where: { userId },
  });

  if (!user || !user.organizationId) {
    throw new Error("User businessId not found");
  }
  const businessId = user.organizationId;
  const accounts = await prisma.mobileMoneyAccount.findMany({
    where: { businessId, isActive: true },
  });
  console.log("mobile accounts", accounts);
  return accounts;
}
