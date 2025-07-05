/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateNextJournalEntryNumber } from "./helper";
import { JournalEntryLineInput } from "./journalEntry";

export async function createPayment(data: any, selectedAccountId?: string) {
  console.log(
    "Creating payment with data:",
    data,
    "selectedAccountId:",
    selectedAccountId
  );
  try {
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

    // Validate required fields
    if (!data.paymentType) throw new Error("Payment type is required");
    if (!data.paymentMethod) throw new Error("Payment method is required");
    if (!data.amount || data.amount <= 0)
      throw new Error("Valid amount is required");

    // Fetch required accounts
    const [arAccount, salesAccount, vatAccount, mobileMoneyAccount, apAccount] =
      await Promise.all([
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "201", isActive: true }, // Accounts Receivable
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "401", isActive: true }, // Sales Revenue
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "202", isActive: true }, // VAT Collected
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "103", isActive: true }, // Mobile Money Account
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "201", isActive: true }, // Accounts Payable
          select: { id: true },
        }),
      ]);

    if (
      !arAccount ||
      !salesAccount ||
      !vatAccount ||
      !mobileMoneyAccount ||
      !apAccount
    )
      throw new Error("Missing one or more required accounts");

    // Get customer info if available
    let customer = null;
    if (data.customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: data.customerId, businessId },
      });
    }

    // Start transaction block
    const result = await prisma.$transaction(
      async tx => {
        // Step 1: Create Payment Record
        const payment = await tx.payment.create({
          data: {
            businessId,
            paymentDate: new Date(),
            paymentNumber: await generateNextPaymentNumber(businessId),
            paymentType: data.paymentType,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            currencyCode: "XAF",
            exchangeRate: 1,
            reference: data.reference || "",
            notes: data.notes || "",
            ...(data.customerId && { customerId: data.customerId }),
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(data.invoiceId && { invoiceId: data.invoiceId }),
            ...(data.purchaseInvoiceId && {
              purchaseInvoiceId: data.purchaseInvoiceId,
            }),
          },
        });

        // Step 2: Create Mobile Money Transaction (if applicable)
        if (data.paymentMethod === "MOBILE_MONEY" && selectedAccountId) {
          await tx.mobileMoneyTransaction.create({
            data: {
              accountId: selectedAccountId,
              paymentId: payment.id,
              transactionType:
                data.paymentType === "Receipt" ? "RECEIVE" : "SEND",
              amount: data.amount,
              recipientNumber: data.reference || "",
              status: "Success",
              transactionDate: new Date(),
            },
          });
        }

        // Step 3: Create Journal Entry
        let lines: JournalEntryLineInput[] = [];

        if (data.paymentType === "Receipt") {
          lines = [
            {
              accountId: mobileMoneyAccount.id,
              creditAmount: data.amount,
              debitAmount: 0,
              description: `Received via ${data.paymentMethod}`,
            },
            {
              accountId: arAccount.id,
              debitAmount: data.amount,
              creditAmount: 0,
              description: `Payment for invoice ${data.invoiceId || ""}`,
            },
          ];
        } else if (data.paymentType === "PAYMENT") {
          lines = [
            {
              accountId: apAccount.id,
              debitAmount: data.amount,
              creditAmount: 0,
              description: `Paid to ${data.supplierName || "Unknown"}`,
            },
            {
              accountId: mobileMoneyAccount.id,
              creditAmount: data.amount,
              debitAmount: 0,
              description: `Outgoing payment #${payment.paymentNumber}`,
            },
          ];
        }

        const totalDebit = lines.reduce(
          (sum, line) => sum + line.debitAmount,
          0
        );
        const totalCredit = lines.reduce(
          (sum, line) => sum + line.creditAmount,
          0
        );

        const journalEntry = await tx.journalEntry.create({
          data: {
            businessId,
            userId: session.user.id,
            entryNumber: await generateNextJournalEntryNumber(businessId),
            transactionDate: new Date(),
            reference: payment.paymentNumber,
            description: `Payment #${payment.paymentNumber}`,
            status: "Posted",
            totalDebit,
            totalCredit,
          },
        });

        await tx.journalEntryLine.createMany({
          data: lines.map(line => ({
            entryId: journalEntry.id,
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            reference: line.reference,
          })),
        });

        // Step 4: Create Transaction Record (for AI/ML module)
        const transactionDescription =
          data.paymentType === "Receipt"
            ? `Customer payment received - ${customer?.name || "Cash Sale"}`
            : `Supplier payment - ${data.supplierName || "Unknown"}`;

        await tx.transaction.create({
          data: {
            businessId,
            type: data.paymentType === "Receipt" ? "SALE" : "EXPENSE",
            amount: data.paymentType === "Receipt" ? data.amount : -data.amount,
            description: transactionDescription,
            date: new Date(),
            accountId: mobileMoneyAccount.id,
            //categoryId:
            // data.paymentType === "Receipt" ? "cat-sale" : "cat-expense",
            paymentId: payment.id,
            ...(data.invoiceId && { invoiceId: data.invoiceId }),
            reference: payment.paymentNumber,
          },
        });

        // Step 5: Audit log
        await tx.auditLog.create({
          data: {
            businessId,
            userId,
            action: "CREATE",
            tableName: "Payment",
            recordId: payment.id,
            newValues: JSON.stringify(payment),
          },
        });

        return payment;
      },
      {
        maxWait: 5000,
        timeout: 8000,
      }
    );

    revalidatePath("/accounting/payments");

    return {
      success: true,
      message: "Payment recorded successfully",
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return {
      success: false,
      message: error.message || "Failed to record payment",
    };
  }
}

export async function getPayments() {
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
  const payments = await prisma.payment.findMany({
    where: { businessId },
    include: {
      customer: true,
      supplier: true,
      invoice: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments.map(pay => ({
    id: pay.id,
    paymentNumber: pay.paymentNumber,
    date: pay.createdAt.toISOString(),
    type: pay.paymentType,
    method: pay.paymentMethod,
    amount: pay.amount,
    name: pay.customer?.name ? pay.customer.name : pay.supplier?.supplierName,
    customerId: pay.customerId,
    supplierId: pay.supplierId,
    invoiceId: pay.invoiceId,
  }));
}

export async function findMatchingInvoices(customerId: string, amount: number) {
  return await prisma.invoice.findMany({
    where: {
      customerId,
      balance: {
        lte: amount + 1000, // Small tolerance for rounding
        gte: amount - 1000,
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      dueDate: true,
      totalAmount: true,
      balance: true,
      customer: {
        select: {
          name: true,
        },
      },
    },
  });
}

async function generateNextPaymentNumber(businessId: string) {
  const lastPayment = await prisma.payment.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  if (!lastPayment) return "PAY-0001";

  const lastNumber = parseInt(lastPayment.paymentNumber.split("-")[1], 10);
  const nextNumber = lastNumber + 1;
  return `PAY-${nextNumber.toString().padStart(4, "0")}`;
}

export async function applyBulkPayment(data: any) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const user = await prisma.member.findFirst({
      where: { userId: session.user.id },
    });

    if (!user || !user.organizationId) {
      throw new Error("User businessId not found");
    }

    const appliedPayments = [];

    for (const payment of data.payments) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        select: {
          id: true,
          balance: true,
          paidAmount: true,
          businessId: true,
          invoiceNumber: true,
          dueDate: true,
          status: true,
        },
      });

      if (!invoice) continue;

      const amountToApply = Math.min(payment.amount, invoice.balance);

      // Update invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: invoice.paidAmount + amountToApply,
          balance: invoice.balance - amountToApply,
          status: amountToApply >= invoice.balance ? "Paid" : invoice.status,
        },
      });

      // Create payment record
      const paymentRecord = await prisma.payment.create({
        data: {
          businessId: user.organizationId,
          paymentNumber: await generateNextPaymentNumber(user.organizationId),
          paymentDate: payment.paymentDate || new Date(),
          paymentType: data.paymentType,
          paymentMethod: data.paymentMethod,
          amount: amountToApply,
          description: `Applied to ${invoice.invoiceNumber}`,
          ...(data.customerId && { customerId: data.customerId }),
          ...(data.supplierId && { supplierId: data.supplierId }),
          invoiceId: invoice.id,
        },
      });

      // Auto-create journal entry
      // const cashAccountId = "acc-103"; // Mobile money account
      //const receivableAccountId = "acc-201";

      // await createManualJournalEntry({
      //   businessId: user.organizationId,
      //   userId: session.user.id,
      //   entryNumber: `JNL-PAY-${updatedInvoice.id}-${paymentRecord.id}`,
      //   transactionDate: payment.paymentDate || new Date(),
      //   description: `Bulk payment applied to invoice #${updatedInvoice.invoiceNumber}`,
      //   lines: [
      //     {
      //       accountId: receivableAccountId,
      //       debitAmount: 0,
      //       creditAmount: amountToApply,
      //       description: `Reduce AR for ${updatedInvoice.invoiceNumber}`
      //     },
      //     {
      //       accountId: cashAccountId,
      //       debitAmount: amountToApply,
      //       creditAmount: 0,
      //       description: `Received via mobile money`
      //     },
      //   ],
      // })

      appliedPayments.push(paymentRecord);
    }

    revalidatePath("/accounting/invoices");
    revalidatePath("/accounting/payments");

    return {
      success: true,
      message: `${appliedPayments.length} payments applied successfully`,
      data: appliedPayments,
    };
  } catch (error: any) {
    console.error("Error applying bulk payment:", error);
    return {
      success: false,
      message: error.message || "Failed to apply payments",
    };
  }
}
