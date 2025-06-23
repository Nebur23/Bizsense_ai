"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function getBusinessId() {
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

    // if (!["user", "ADMIN"].includes(user.role)) {
    //   throw new Error(
    //     "Unauthorized: Insufficient permissions to create accounts"
    //   );
    // }

    const businessId = user.organizationId;

    //seed default chart of accounts

    return businessId;
  } catch (error) {
    console.error("Error creating business:", error);
    throw new Error("Something went wrong please retry again!");
  }
}
