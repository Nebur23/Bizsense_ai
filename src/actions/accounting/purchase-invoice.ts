/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { generateNextPurchaseInvoiceNumber } from "./helper";

// types/purchase.ts
// interface PurchaseInvoiceItemInput {
//   productId: string;
//   quantity: number;
//   unitCost: number;
//   taxRate?: number;
//   description?: string;
// }

// interface CreatePurchaseInvoiceInput {
//   supplierId: string;
//   poId?: string | null;
//   invoiceNumber?: string;
//   invoiceDate: Date;
//   dueDate: Date;
//   status?: "Pending" | "Approved" | "Paid";
//   reference?: string;
//   items: PurchaseInvoiceItemInput[];
// }

// interface UpdatePurchaseInvoiceInput {
//   status?: "Pending" | "Approved" | "Paid";
//   reference?: string;
//   items?: PurchaseInvoiceItemInput[];
// }

// interface CreatePurchasePaymentInput {
//   amount: number;
//   paymentDate: Date;
//   paymentMethod: "Cash" | "Bank" | "Mobile Money";
//   reference?: string;
//   notes?: string;
// }

export async function createPurchaseInvoice(data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) throw new Error("Unauthorized");

  try {
    // Pre-transaction validation
    const user = await prisma.member.findFirst({
      where: { userId },
      select: { organizationId: true },
    });

    if (!user) throw new Error("User not found");
    if (!user.organizationId) throw new Error("User businessId not found");

    const invoiceNumber = await generateNextPurchaseInvoiceNumber(
      user.organizationId
    );

    const businessId = user.organizationId;
    const invoice = await prisma.purchaseInvoice.create({
      data: {
        businessId,
        supplierId: data.supplierId,
        invoiceNumber,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        status: "Pending",
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        balance: data.totalAmount,
        currencyCode: "XAF",
        // items: {
        //   createMany: {
        //     data: data.items.map(item => ({
        //       productId: item.productId,
        //       quantity: item.quantity,
        //       unitCost: item.unitCost,
        //       taxRate: item.taxRate,
        //       taxAmount: item.taxAmount,
        //       lineTotal: item.lineTotal,
        //       description: item.description || "",
        //     })),
        //   },
        // },
      },
    });

    // Auto-create journal entry
    //const cogsAccountId = "acc-501"; // Cost of Goods Sold
    //const apAccountId = "acc-201"; // Accounts Payable
    // Auto-create journal entry
    //const accountsPayable = "acc-201"; // Accounts Payable
    //const inventoryAccount = "acc-104"; // Inventory account
    //const vatPaid = "acc-202"; // VAT Collected

    // await createManualJournalEntry({
    //   entryNumber: `JNL-${invoice.id}`,
    //   transactionDate: data.invoiceDate,
    //   description: `Purchase invoice #${invoice.invoiceNumber}`,
    //   lines: [
    //     {
    //       accountId: cogsAccountId,
    //       debitAmount: data.subtotal,
    //       creditAmount: 0,
    //       description: `Inventory purchase`,
    //     },
    //     {
    //       accountId: apAccountId,
    //       debitAmount: 0,
    //       creditAmount: data.totalAmount,
    //       description: `Supplier payment due`,
    //     },
    //   ],
    // });

    // await createManualJournalEntry({
    //   businessId: user.organizationId,
    //   userId: session.user.id,
    //   entryNumber: `JNL-${invoice.id}`,
    //   transactionDate: data.invoiceDate,
    //   description: `Purchase invoice #${invoice.invoiceNumber}`,
    //   lines: [
    //     {
    //       accountId: inventoryAccount,
    //       debitAmount: subtotal,
    //       creditAmount: 0,
    //       description: `Inventory purchase`,
    //     },
    //     {
    //       accountId: vatPaid,
    //       debitAmount: taxAmount,
    //       creditAmount: 0,
    //       description: `VAT Paid`,
    //     },
    //     {
    //       accountId: accountsPayable,
    //       debitAmount: 0,
    //       creditAmount: totalAmount,
    //       description: `Supplier payment due`,
    //     },
    //   ],
    // });

    return {
      success: true,
      message: "Invoice created sucessfully",
      invoice,
    };
  } catch (error: any) {
    console.error("Error creating purchase invoice:", error);
    throw new Error(`Failed to create purchase invoice: ${error.message}`);
  }
}

// app/api/purchases/invoices/read.ts
// interface GetPurchaseInvoicesOptions {
//   status?: string[];
//   supplierId?: string;
//   poId?: string;
//   startDate?: Date;
//   endDate?: Date;
//   page?: number;
//   pageSize?: number;
// }

export async function getPurchaseInvoices() {
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
  return await prisma.purchaseInvoice.findMany({
    where: { businessId },
    include: {
      supplier: true,
      payments: true,
    },
  });
}

// app/api/purchase-invoices/create.ts
// export async function createPurchaseInvoice(data: CreatePurchaseInvoiceInput) {
//   try {
//     const session = await auth();
//     if (!session?.user.id) throw new Error("Unauthorized");

//     const userMembership = await prisma.member.findFirst({
//       where: { userId: session.user.id },
//       select: { organizationId: true, role: true }
//     });

//     if (!userMembership?.organizationId) throw new Error("User business not found");

//     // Validate supplier belongs to business
//     const supplier = await prisma.supplier.findUnique({
//       where: {
//         id: data.supplierId,
//         businessId: userMembership.organizationId
//       }
//     });
//     if (!supplier) throw new Error("Supplier not found");

//     // Validate PO if provided
//     if (data.poId) {
//       const po = await prisma.purchaseOrder.findUnique({
//         where: {
//           id: data.poId,
//           businessId: userMembership.organizationId
//         }
//       });
//       if (!po) throw new Error("Purchase order not found");
//     }

//     return await prisma.$transaction(async (prisma) => {
//       // Calculate totals
//       const itemsWithTotals = data.items.map(item => ({
//         ...item,
//         taxAmount: item.unitCost * item.quantity * (item.taxRate || 0) / 100,
//         lineTotal: item.unitCost * item.quantity
//       }));

//       const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0);
//       const taxAmount = itemsWithTotals.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
//       const totalAmount = subtotal + taxAmount;

//       // Create purchase invoice
//       const invoice = await prisma.purchaseInvoice.create({
//         data: {
//           businessId: userMembership.organizationId,
//           supplierId: data.supplierId,
//           poId: data.poId,
//           invoiceNumber: data.invoiceNumber,
//           invoiceDate: data.invoiceDate,
//           dueDate: data.dueDate,
//           status: data.status || "Pending",
//           subtotal,
//           taxAmount,
//           totalAmount,
//           paidAmount: 0,
//           balance: totalAmount,
//           reference: data.reference
//         }
//       });

//       // Create invoice items
//       await prisma.purchaseInvoiceItem.createMany({
//         data: itemsWithTotals.map(item => ({
//           invoiceId: invoice.id,
//           productId: item.productId,
//           quantity: item.quantity,
//           unitCost: item.unitCost,
//           taxRate: item.taxRate,
//           taxAmount: item.taxAmount,
//           lineTotal: item.lineTotal,
//           description: item.description
//         }))
//       });

//       // Update linked PO status if provided
//       if (data.poId) {
//         await prisma.purchaseOrder.update({
//           where: { id: data.poId },
//           data: { status: "Invoiced" }
//         });
//       }

//       // Create audit log
//       await prisma.auditLog.create({
//         data: {
//           businessId: userMembership.organizationId,
//           userId: session.user.id,
//           action: "CREATE",
//           tableName: "PurchaseInvoice",
//           recordId: invoice.id,
//           newValues: JSON.stringify(invoice)
//         }
//       });

//       revalidatePaths(["/purchases/invoices", "/api/purchase-invoices"]);

//       return {
//         success: true,
//         message: "Purchase invoice created successfully",
//         data: invoice
//       };
//     });

//   } catch (error: any) {
//     console.error("Error creating purchase invoice:", error);
//     return {
//       success: false,
//       message: error.message || "Failed to create purchase invoice",
//       error: error
//     };
//   }
// }
