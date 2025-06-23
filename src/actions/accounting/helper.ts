import prisma from "@/lib/prisma";
import { calculateNextDueDate, createInvoiceFromTemplate } from "./invoices";

export async function getAccountBalance(
  accountId: string,
  asOfDate?: Date
): Promise<number> {
  const where = {
    accountId,
    journalEntry: {
      status: "Posted",
      ...(asOfDate && { transactionDate: { lte: asOfDate } }),
    },
  };

  const result = await prisma.journalEntryLine.aggregate({
    where,
    _sum: {
      debitAmount: true,
      creditAmount: true,
    },
  });

  const totalDebit = result._sum.debitAmount || 0;
  const totalCredit = result._sum.creditAmount || 0;

  // Get account type to determine normal balance
  const account = await prisma.chartOfAccounts.findUnique({
    where: { id: accountId },
    include: { accountType: true },
  });

  if (!account) throw new Error("Account not found");

  // Asset and Expense accounts normally have debit balances
  // Liability, Equity, and Income accounts normally have credit balances
  const isDebitAccount = ["Asset", "Expense"].includes(
    account.accountType.name
  );

  return isDebitAccount ? totalDebit - totalCredit : totalCredit - totalDebit;
}

export async function generateNextJournalEntryNumber(
  businessId: string
): Promise<string> {
  const lastEntry = await prisma.journalEntry.findFirst({
    where: { businessId },
    orderBy: { entryNumber: "desc" },
    select: { entryNumber: true },
  });

  if (!lastEntry) return "JE-00001";

  const lastNumber = parseInt(lastEntry.entryNumber.split("-")[1]);
  return `JE-${(lastNumber + 1).toString().padStart(5, "0")}`;
}

export async function generateRecurringInvoices(
  businessId: string = "business-1"
) {
  const today = new Date();
  const recurringInvoices = await prisma.invoice.findMany({
    where: {
      businessId,
      isRecurring: true,
      nextDueDate: { lte: today },
    },
    include: {
      items: true,
    },
  });

  const generatedInvoices = [];

  for (const inv of recurringInvoices) {
    const newInvoice = await createInvoiceFromTemplate(inv.id);
    generatedInvoices.push(newInvoice);

    // Update next due date
    await prisma.invoice.update({
      where: { id: inv.id },
      data: {
        nextDueDate: await calculateNextDueDate(inv.recurringType!),
      },
    });
  }

  return {
    count: generatedInvoices.length,
    generatedInvoices,
  };
}

export function generateNextPurchaseInvoiceNumber(
  lastNumber: string | null
): string {
  const prefix = "PINV-";
  const nextNum = lastNumber
    ? parseInt(lastNumber.replace(prefix, ""), 10) + 1
    : 1;

  return `${prefix}${nextNum.toString().padStart(4, "0")}`;
}
