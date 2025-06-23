/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { generateNextJournalEntryNumber } from "./helper";

// types/invoice.ts
interface InvoiceItemInput {
  productId: string;
  quantity: number;
  sellingPrice: number;
  taxRate?: number;
  description?: string;
}

interface CreateInvoiceInput {
  customerId: string;
  invoiceDate: Date;
  dueDate: Date;
  status?: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
  reference?: string;
  notes?: string;
  items: InvoiceItemInput[];
}

// interface UpdateInvoiceInput {
//   status?: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
//   reference?: string;
//   notes?: string;
//   items?: InvoiceItemInput[];
// }

// app/api/invoices/read.ts
interface GetInvoicesOptions {
  status?: string[];
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export async function getInvoices(options: GetInvoicesOptions = {}) {
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

    const where = {
      businessId,
      isDeleted: false,
      ...(options.status && { status: { in: options.status } }),
      ...(options.customerId && { customerId: options.customerId }),
      ...(options.startDate && { invoiceDate: { gte: options.startDate } }),
      ...(options.endDate && { invoiceDate: { lte: options.endDate } }),
    };

    const [invoices] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
              customerCode: true,
            },
          },
          // items: {
          //   include: {
          //     product: {
          //       select: {
          //         name: true,
          //         productCode: true,
          //       },
          //     },
          //   },
          // },
          payments: true,
        },
        orderBy: { invoiceDate: "desc" },
        skip:
          options.page && options.pageSize
            ? (options.page - 1) * options.pageSize
            : undefined,
        take: options.pageSize,
      }),
      prisma.invoice.count({ where }),
    ]);

    // return {
    //   success: true,
    //   data: invoices,
    //   pagination: {
    //     total,
    //     page: options.page || 1,
    //     pageSize: options.pageSize || total,
    //     totalPages: options.pageSize ? Math.ceil(total / options.pageSize) : 1
    //   }
    // };

    console.log("invoices");

    return invoices.map(inv => ({
      id: inv.id,
      number: inv.invoiceNumber,
      customer: inv.customer?.name || "N/A",
      amount: inv.totalAmount,
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      businessId,
    }));
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    throw new Error(error.message || "Failed to fetch invoices");
  }
}
export async function getInvoice(id: string) {
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
    const invoice = await prisma.invoice.findUnique({
      where: { id, businessId },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        payments: true,
      },
    });
    if (!invoice) throw new Error("Invoice not found");
    // Check if the invoice belongs to the user's business
    if (invoice.businessId !== businessId) {
      throw new Error("Invoice does not belong to your business");
    }
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      balance: invoice.balance,
      isRecurring: invoice.isRecurring,
      recurringType: invoice.recurringType,
      nextDueDate: invoice.nextDueDate,
      customer: {
        name: invoice.customer?.name || "N/A",
        phone: invoice.customer?.phone || "N/A",
        email: invoice.customer?.email || "N/A",
      },
      items: invoice.items.map(item => ({
        productName: item.product?.name || "N/A",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        lineTotal: item.lineTotal,
      })),
      payments: invoice.payments.map(payment => ({
        paymentNumber: payment.paymentNumber,
        amount: payment.amount,
        paymentDate: payment.paymentDate.toISOString(),
        method: payment.paymentMethod,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    throw new Error(error.message || "Failed to fetch invoice");
  }
}

//create
// app/api/invoices/create.ts
export async function createInvoice(data: CreateInvoiceInput) {
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

    const businessId = user.organizationId;

    // Validate customer exists before transaction
    const customer = await prisma.customer.findUnique({
      where: {
        id: data.customerId,
        businessId,
      },
      select: { id: true, name: true },
    });
    if (!customer) throw new Error("Customer not found");

    // Get accounts before transaction to reduce DB calls inside
    const [arAccount, salesAccount, vatAccount] = await Promise.all([
      prisma.chartOfAccounts.findFirst({
        where: {
          businessId,
          accountCode: "105",
          isActive: true,
          isDebit: true,
          accountType: { name: "Asset" },
        },
        select: { id: true },
      }),
      prisma.chartOfAccounts.findFirst({
        where: {
          businessId,
          accountCode: "401",
          isActive: true,
          isDebit: false,
          accountType: { name: "Income" },
        },
        select: { id: true },
      }),
      prisma.chartOfAccounts.findFirst({
        where: {
          businessId,
          accountCode: "202",
          isActive: true,
          isDebit: false,
          accountType: { name: "Liability" },
        },
        select: { id: true },
      }),
    ]);

    if (!arAccount) throw new Error("Accounts Receivable account not found");
    if (!salesAccount) throw new Error("Sales Revenue account not found");
    if (!vatAccount) throw new Error("VAT Collected account not found");

    // Calculate totals outside transaction
    const itemsWithTotals = data.items.map(item => ({
      ...item,
      taxAmount:
        (item.sellingPrice * item.quantity * (item.taxRate || 0)) / 100,
      lineTotal: item.sellingPrice * item.quantity,
    }));

    const subtotal = itemsWithTotals.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const taxAmount = itemsWithTotals.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0
    );
    const totalAmount = subtotal + taxAmount;

    // Execute critical operations in transaction with increased timeout
    const result = await prisma.$transaction(
      async prisma => {
        const invoiceNumber = await generateNextInvoiceNumber(businessId);

        const invoice = await prisma.invoice.create({
          data: {
            businessId,
            customerId: data.customerId,
            invoiceNumber,
            invoiceDate: data.invoiceDate,
            dueDate: data.dueDate,
            status: data.status || "Draft",
            subtotal,
            taxAmount,
            totalAmount,
            paidAmount: 0,
            balance: totalAmount,
            notes: data.notes,
          },
        });

        await prisma.invoiceItem.createMany({
          data: itemsWithTotals.map(item => ({
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.sellingPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            lineTotal: item.lineTotal,
            description: item.description,
          })),
        });

        interface JournalEntryLine {
          accountId: string;
          debitAmount: number;
          creditAmount: number;
          description: string;
          reference?: string;
        }

        const lines: JournalEntryLine[] = [
          {
            accountId: arAccount.id,
            debitAmount: totalAmount,
            creditAmount: 0,
            description: `Accounts Receivable for Invoice #${invoiceNumber}`,
          },
          {
            accountId: salesAccount.id,
            debitAmount: 0,
            creditAmount: subtotal,
            description: `Sales Revenue for Invoice #${invoiceNumber}`,
          },
          {
            accountId: vatAccount.id,
            debitAmount: 0,
            creditAmount: taxAmount,
            description: `VAT Collected for Invoice #${invoiceNumber}`,
          },
        ];

        const totalDebit = lines.reduce(
          (sum, line) => sum + line.debitAmount,
          0
        );
        const totalCredit = lines.reduce(
          (sum, line) => sum + line.creditAmount,
          0
        );

        const journalEntry = await prisma.journalEntry.create({
          data: {
            businessId,
            userId: session.user.id,
            entryNumber: await generateNextJournalEntryNumber(businessId),
            transactionDate: data.invoiceDate,
            reference: invoice.id,
            description: `Invoice #${invoiceNumber} for customer ${customer.name}`,
            status: "Posted",
            totalDebit,
            totalCredit,
          },
        });

        await prisma.journalEntryLine.createMany({
          data: lines.map(line => ({
            entryId: journalEntry.id,
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            reference: line.reference,
          })),
        });

        return invoice;
      },
      {
        maxWait: 10000, // 10 seconds max wait
        timeout: 10000, // 10 seconds timeout
      }
    );

    // Non-critical operation outside transaction
    await prisma.auditLog.create({
      data: {
        businessId,
        userId,
        action: "CREATE",
        tableName: "Invoice",
        recordId: result.id,
        newValues: JSON.stringify(result),
      },
    });

    return {
      success: true,
      message: "Invoice created successfully",
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      message: error.message || "Failed to create invoice",
      error: error,
    };
  }
}

async function generateNextInvoiceNumber(businessId: string): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { businessId },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  if (!lastInvoice) return "INV-00001";
  const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1]);
  return `INV-${(lastNumber + 1).toString().padStart(5, "0")}`;
}

export async function applyPaymentToInvoice(invoiceId: string, amount: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true },
  });

  if (!invoice) throw new Error("Invoice not found");

  const newPaidAmount = invoice.paidAmount + amount;
  const newBalance = invoice.totalAmount - newPaidAmount;
  let newStatus = invoice.status;

  // Update status based on payment
  if (newPaidAmount >= invoice.totalAmount) {
    newStatus = "Paid";
  } else if (newBalance > 0 && new Date(invoice.dueDate) < new Date()) {
    newStatus = "Overdue";
  }

  // Update invoice
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newPaidAmount,
      balance: newBalance,
      status: newStatus,
    },
  });

  // Auto-create journal entry
  // await createManualJournalEntry({
  //   entryNumber: `JNL-PAY-${invoiceId}-${updatedInvoice.id}`,
  //   transactionDate: new Date(),
  //   description: `Payment applied to invoice #${invoice.invoiceNumber}`,
  //   lines: [
  //     {
  //       accountId: 'acc-201',
  //       debitAmount: 0,
  //       creditAmount: amount,
  //       description: `Payment applied`
  //     },
  //     {
  //       accountId: 'acc-103',
  //       debitAmount: amount,
  //       creditAmount: 0,
  //       description: `From mobile money`
  //     },
  //   ],
  // })

  // revalidatePath(`/accounting/invoices/${invoiceId}`)
  return updatedInvoice;
}

export async function getInvoicesForCustomer(customerId: string) {
  return await prisma.invoice.findMany({
    where: {
      customerId,
      status: { not: "Paid" },
    },
    select: {
      id: true,
      invoiceNumber: true,
      totalAmount: true,
      balance: true,
      dueDate: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });
}

export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: string
) {
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

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, businessId },
      include: { payments: true },
    });

    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status === "Paid")
      throw new Error("Cannot modify paid invoice");

    let updatedInvoice;

    // Handle different status changes
    if (newStatus === "Paid") {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid < invoice.totalAmount) {
        throw new Error("Invoice is not fully paid");
      }
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newStatus,
          paidAmount: invoice.totalAmount,
          balance: 0,
        },
      });
    } else if (newStatus === "Overdue" && invoice.dueDate > new Date()) {
      throw new Error("Cannot mark future-dated invoice as overdue");
    } else {
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }

    // Fetch required accounts
    const [arAccount, mobileMoneyAccount] = await Promise.all([
      prisma.chartOfAccounts.findFirst({
        where: { businessId, accountCode: "105", isActive: true },
        select: { id: true },
      }),

      prisma.chartOfAccounts.findFirst({
        where: { businessId, accountCode: "103", isActive: true },
        select: { id: true },
      }),
    ]);

    if (!arAccount || !mobileMoneyAccount)
      throw new Error("Missing one or more required accounts");

    // Auto-create journal entry if needed
    if (newStatus === "Paid") {
      const lines = [
        {
          accountId: arAccount.id, // Accounts Receivable
          debitAmount: invoice.balance,
          creditAmount: 0,
          description: `Payment received`,
        },
        {
          accountId: mobileMoneyAccount.id, // Mobile Money
          debitAmount: 0,
          creditAmount: invoice.balance,
          description: `Received via mobile money`,
        },
      ];

      const totalDebit = lines.reduce((sum, line) => sum + line.debitAmount, 0);
      const totalCredit = lines.reduce(
        (sum, line) => sum + line.creditAmount,
        0
      );

      const journalEntry = await prisma.journalEntry.create({
        data: {
          businessId,
          userId: session.user.id,
          entryNumber: await generateNextJournalEntryNumber(businessId),
          transactionDate: new Date(),
          reference: invoice.invoiceNumber,
          description: `Marked invoice #${invoice.invoiceNumber} as paid`,
          status: "Posted",
          totalDebit,
          totalCredit,
        },
      });

      await prisma.journalEntryLine.createMany({
        data: lines.map(line => ({
          entryId: journalEntry.id,
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description,
        })),
      });
    }

    /// revalidatePath(`/accounting/invoices/${invoiceId}`);

    return {
      success: true,
      message: `Invoice status updated to ${newStatus}`,
      data: updatedInvoice,
    };
  } catch (error: any) {
    console.error("Error updating invoice status:", error);
    return {
      success: false,
      message: error.message || "Failed to update invoice status",
    };
  }
}

enum RecurringType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}

export async function updateInvoiceRecurringStatus(
  invoiceId: string,
  isRecurring: boolean,
  recurringType: RecurringType
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.member.findFirst({
    where: { userId: session.user.id },
  });

  if (!user || !user.organizationId) {
    throw new Error("User businessId not found");
  }

  const nextDueDate = isRecurring
    ? await calculateNextDueDate(recurringType)
    : null;
  const updated = await prisma.invoice.update({
    where: { id: invoiceId, businessId: user.organizationId },
    data: {
      isRecurring,
      recurringType: isRecurring ? recurringType : null,
      nextDueDate,
    },
  });

  // revalidatePath(`/accounting/invoices/${invoiceId}`)

  return updated;
}

export async function calculateNextDueDate(type: string): Promise<Date> {
  const today = new Date();

  switch (type) {
    case "DAILY":
      return new Date(today.setDate(today.getDate() + 1));
    case "WEEKLY":
      return new Date(today.setDate(today.getDate() + 7));
    case "MONTHLY":
      return new Date(today.setMonth(today.getMonth() + 1));
    case "QUARTERLY":
      return new Date(today.setMonth(today.getMonth() + 3));
    case "YEARLY":
      return new Date(today.setFullYear(today.getFullYear() + 1));
    default:
      return new Date(today.setDate(today.getDate() + 30)); // Default to monthly
  }
}

export async function createInvoiceFromTemplate(templateId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.member.findFirst({
    where: { userId: session.user.id },
  });

  if (!user || !user.organizationId) {
    throw new Error("User businessId not found");
  }

  const template = await prisma.invoice.findUnique({
    where: { id: templateId },
    include: { items: true },
  });

  if (!template) throw new Error("Template not found");

  // Clone invoice without linking to parent
  const newInvoice = await prisma.invoice.create({
    data: {
      businessId: user.organizationId,
      customerId: template.customerId,
      invoiceNumber: await generateNextInvoiceNumber(user.organizationId),
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: template.notes,
      subtotal: template.subtotal,
      taxAmount: template.taxAmount,
      totalAmount: template.totalAmount,
      paidAmount: 0,
      balance: template.balance,
      currencyCode: "XAF",
      exchangeRate: 1,
      status: "Sent",
      items: {
        createMany: {
          data: template.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            lineTotal: item.lineTotal,
            description: item.description || "",
          })),
        },
      },
    },
  });

  return newInvoice;
}
