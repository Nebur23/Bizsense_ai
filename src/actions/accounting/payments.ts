/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateNextJournalEntryNumber } from "./helper";

export async function createPayment(data: any, selectedAccountId?: string) {
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
          where: { businessId, accountCode: "105", isActive: true },
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "401", isActive: true },
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "202", isActive: true },
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "103", isActive: true },
          select: { id: true },
        }),
        prisma.chartOfAccounts.findFirst({
          where: { businessId, accountCode: "201", isActive: true },
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

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, businessId },
    });

    // Start transaction
    const result = await prisma.$transaction(
      async tx => {
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

        // Create mobile money transaction if applicable
        if (data.paymentMethod === "MOBILE_MONEY" && selectedAccountId) {
          await prisma.mobileMoneyTransaction.create({
            data: {
              accountId: selectedAccountId,
              paymentId: payment.id,
              transactionType:
                data.paymentType === "Receipt" ? "RECEIVE" : "SEND",
              amount: data.amount,
              recipientNumber: data.reference || "",
              reference: data.notes || "",
              status: "Success",
              transactionDate: new Date(),
            },
          });
        }

        interface JournalEntryLine {
          accountId: string;
          debitAmount: number;
          creditAmount: number;
          description: string;
          reference?: string;
        }

        let lines: JournalEntryLine[] = [];

        if (data.paymentType === "Receipt") {
          lines = [
            {
              accountId: mobileMoneyAccount.id,
              creditAmount: data.amount,
              debitAmount: 0,
              description: `Received from ${customer?.name || "Unknown"}`,
            },
            {
              accountId: arAccount.id,
              debitAmount: data.amount,
              creditAmount: 0,
              description: `Payment for invoice ${data.invoiceId || ""}`,
            },
          ];
        } else if (data.paymentType === "Payment") {
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
              description: `Payment #${payment.paymentNumber}`,
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

        await tx.auditLog.create({
          data: {
            businessId,
            userId,
            action: "CREATE",
            tableName: "JournalEntry",
            recordId: journalEntry.id,
            newValues: JSON.stringify(journalEntry),
          },
        });

        return payment;
      },
      {
        maxWait: 5000, // Keep short for responsiveness
        timeout: 8000, // Reasonable for journal+payment
      }
    );

    await prisma.auditLog.create({
      data: {
        businessId,
        userId,
        action: "CREATE",
        tableName: "Payment",
        recordId: result.id,
        newValues: JSON.stringify(result),
      },
    });

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
