/* eslint-disable @typescript-eslint/no-explicit-any */
export const JOURNAL_RULES = {
  INVOICE_CREATED: {
    lines: [
      { accountId: "105", side: "debit" }, // Accounts Receivable
      { accountId: "401", side: "credit" }, // Sales Revenue
      { accountId: "202", side: "credit" }, // VAT Collected
    ],
  },
  PAYMENT_RECEIVED: {
    lines: [
      { accountId: "103", side: "debit" }, // Mobile Money
      { accountId: "105", side: "credit" }, // Reduce Accounts Receivable
    ],
  },
  EXPENSE_RECORD: {
    lines: [
      { accountId: "504", side: "debit" }, // COGS or Expense
      { accountId: "103", side: "credit" }, // Paid via Mobile Money
    ],
  },
  TRANSFER_BETWEEN_ACCOUNTS: (
    fromAccountId: any,
    toAccountId: any,
    amount: any
  ) => ({
    lines: [
      { accountId: fromAccountId, side: "credit" },
      { accountId: toAccountId, side: "debit" },
    ],
    total: amount,
  }),
};
