"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getCustomers() {
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

    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched customers:", customers);

    return customers;
  } catch (error) {
    console.error("Error fetching customers :", error);
    throw new Error("Failed to fetch customers ");
  }
}
