"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getSuppliers() {
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

    const suppliers = await prisma.supplier.findMany({
      where: {
        businessId,
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched supploers:", suppliers);

    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers :", error);
    throw new Error("Failed to fetch suppliers ");
  }
}
