"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function updateDefaultAccount(accountId: string): Promise<{
  statusCode: number;
  message: string;
}> {
  try {
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

    // First, unset any existing default account
    await prisma.financialAccount.updateMany({
      where: { businessId, isDefault: true },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await prisma.financialAccount.update({
      where: {
        id: accountId,
        businessId,
      },
      data: { isDefault: true },
    });

    return {
      statusCode: 200,
      message: `${account.name} Account updated as default!`,
    };
  } catch (error) {
    console.error("Error updating default account:", error);
    return {
      statusCode: 500,
      message: "Something went wrong please retry again!",
    };
  }
}
