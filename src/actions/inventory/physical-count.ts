/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function recordPhysicalCount(data: any) {
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

    // Save physical count
    const count = await prisma.physicalCount.create({
      data: {
        businessId,
        userId: session.user.id,
        status: "COMPLETED",
        countNumber: `PC-${Date.now()}`, // Generate a unique count number
        startDate: data.countDate,
        completedDate: new Date(),
        notes: "Monthly stock verification",
        items: {
          createMany: {
            data: data.items.map(
              (item: {
                productId: any;
                expectedQuantity: any;
                actualQuantity: any;
                variance: any;
                notes: any;
              }) => ({
                productId: item.productId,
                expectedQuantity: item.expectedQuantity,
                actualQuantity: item.actualQuantity,
                variance: item.variance,
                notes: item.notes || "",
              })
            ),
          },
        },
      },
    });

    // Update stock quantities
    for (const item of data.items) {
      const variance = item.variance;
      if (variance !== 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: item.actualQuantity,
          },
        });

        // Create journal entry for adjustment
        //const inventoryAccount = "acc-104";
        //const gainLossAccount = "acc-509"; // Other Expenses

        // await createManualJournalEntry({
        //   businessId: user.organizationId,
        //   userId: session.user.id,
        //   entryNumber: `JNL-STOCK-${item.productId}-${count.id}`,
        //   transactionDate: data.countDate,
        //   description: `Adjustment from physical count`,
        //   lines: [
        //     {
        //       accountId: inventoryAccount,
        //       debitAmount: variance > 0 ? variance * item.unitPrice : 0,
        //       creditAmount:
        //         variance < 0 ? Math.abs(variance) * item.unitPrice : 0,
        //       description: `Stock adjustment for ${item.productId}`,
        //     },
        //     {
        //       accountId: gainLossAccount,
        //       debitAmount:
        //         variance < 0 ? Math.abs(variance) * item.unitPrice : 0,
        //       creditAmount: variance > 0 ? variance * item.unitPrice : 0,
        //       description: `Gain/Loss from physical count`,
        //     },
        //   ],
        // });
      }
    }

    revalidatePath("/inventory/physical-count");
    return {
      success: true,
      message: "Physical count recorded and stock updated",
      data: count,
    };
  } catch (error: any) {
    console.error("Error recording physical count:", error);
    return {
      success: false,
      message: error.message || "Failed to record physical count",
    };
  }
}
