"use server";

import prisma from "@/lib/prisma";

export async function seedDefaultChartOfAccounts(businessId: string) {
  const defaultCOA = [
    // Assets
    { code: "101", name: "Cash in Hand", type: "Asset" },
    { code: "102", name: "Bank - BICEC", type: "Asset" },
    { code: "103", name: "Mobile Money - MTN", type: "Asset" },
    { code: "104", name: "Inventory", type: "Asset" },
    { code: "105", name: "Accounts Receivable", type: "Asset" },

    // Liabilities
    { code: "201", name: "Accounts Payable", type: "Liability" },
    { code: "202", name: "VAT Collected", type: "Liability" },
    { code: "203", name: "Loans Payable", type: "Liability" },

    // Equity
    { code: "301", name: "Capital", type: "Equity" },
    { code: "302", name: "Retained Earnings", type: "Equity" },

    // Income
    { code: "401", name: "Sales Revenue", type: "Income" },
    { code: "402", name: "Other Income", type: "Income" },

    // Expenses
    { code: "501", name: "Cost of Goods Sold", type: "Expense" },
    { code: "502", name: "Salaries", type: "Expense" },
    { code: "503", name: "Rent", type: "Expense" },
    { code: "504", name: "Utilities", type: "Expense" },
    { code: "505", name: "Transportation", type: "Expense" },
  ];

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) throw new Error("❌ Business not found");

  const existing = await prisma.chartOfAccounts.count({
    where: { businessId },
  });

  if (existing > 0) {
    console.log("ℹ️ Chart of accounts already exists. Skipping seeding.");
    return;
  }

  const accountTypes = await prisma.accountType.findMany();
  const accountTypeMap = accountTypes.reduce<Record<string, number>>(
    (acc, type) => {
      acc[type.name] = type.id;
      return acc;
    },
    {}
  );

  for (const account of defaultCOA) {
    const typeId = accountTypeMap[account.type];
    if (!typeId)
      throw new Error(`❌ Account type "${account.type}" not found.`);

    await prisma.chartOfAccounts.create({
      data: {
        businessId,
        accountCode: account.code,
        accountName: account.name,
        accountTypeId: typeId,
        isActive: true,
        isDebit: ["Asset", "Expense"].includes(account.type),
      },
    });
  }

  console.log("✔️ Default chart of accounts seeded");
}

export async function setupDefaultTaxTypes(businessId: string) {
  const defaultTaxes = [
    { taxName: "VAT", taxCode: "VAT", taxRate: 19.25 },
    { taxName: "Withholding Tax", taxCode: "WHT", taxRate: 5.5 },
    { taxName: "0%", taxCode: "ZERO", taxRate: 0 },
    // Add other Cameroon-specific defaults
  ];

  return await prisma.$transaction(
    defaultTaxes.map(tax =>
      prisma.taxType.create({
        data: {
          businessId,
          ...tax,
          isActive: true,
        },
      })
    )
  );
}

/**
 * Seeds an OHADA-compliant Chart of Accounts for a business
 */
// export async function seedDefaultCOA(businessId: string) {
//   // Check if COA already exists
//   const existing = await prisma.chartOfAccounts.count({
//     where: { businessId }
//   })

//   if (existing > 0) {
//     console.log("Chart of Accounts already exists")
//     return false
//   }

//   // Define OHADA-compliant accounts
//   const coaTemplate = [
//     // Assets (Code range: 101 - 199)
//     {
//       code: "101", name: "Cash in Hand", type: "Asset",
//       description: "Physical cash available in business"
//     },
//     {
//       code: "102", name: "Bank - BICEC", type: "Asset",
//       description: "Main bank account"
//     },
//     {
//       code: "103", name: "MTN Mobile Money", type: "Asset",
//       description: "Mobile money account (Cameroon)"
//     },
//     {
//       code: "104", name: "Inventory", type: "Asset",
//       description: "Stock of goods for sale"
//     },
//     {
//       code: "105", name: "Accounts Receivable", type: "Asset",
//       description: "Money owed by customers"
//     },
//     {
//       code: "106", name: "Prepaid Expenses", type: "Asset",
//       description: "Expenses paid in advance"
//     },

//     // Liabilities (Code range: 201 - 299)
//     {
//       code: "201", name: "Accounts Payable", type: "Liability",
//       description: "Money owed to suppliers"
//     },
//     {
//       code: "202", name: "VAT Collected", type: "Liability",
//       description: "VAT collected from customers"
//     },
//     {
//       code: "203", name: "Loans Payable", type: "Liability",
//       description: "Business loans"
//     },
//     {
//       code: "204", name: "Accrued Expenses", type: "Liability",
//       description: "Unpaid expenses incurred"
//     },

//     // Equity (Code range: 301 - 399)
//     {
//       code: "301", name: "Capital", type: "Equity",
//       description: "Initial capital investment"
//     },
//     {
//       code: "302", name: "Retained Earnings", type: "Equity",
//       description: "Undistributed profits"
//     },
//     {
//       code: "303", name: "Owner's Drawings", type: "Equity",
//       description: "Funds withdrawn by owner"
//     },

//     // Income (Code range: 401 - 499)
//     {
//       code: "401", name: "Sales Revenue", type: "Income",
//       description: "Revenue from sales"
//     },
//     {
//       code: "402", name: "Other Income", type: "Income",
//       description: "Non-sales income"
//     },

//     // Expenses (Code range: 501 - 599)
//     {
//       code: "501", name: "Cost of Goods Sold", type: "Expense",
//       description: "Direct cost of products sold"
//     },
//     {
//       code: "502", name: "Salaries", type: "Expense",
//       description: "Employee salaries"
//     },
//     {
//       code: "503", name: "Rent", type: "Expense",
//       description: "Shop or office rent"
//     },
//     {
//       code: "504", name: "Utilities", type: "Expense",
//       description: "Electricity, water, internet"
//     },
//     {
//       code: "505", name: "Transportation", type: "Expense",
//       description: "Delivery and transport costs"
//     },
//     {
//       code: "506", name: "Depreciation", type: "Expense",
//       description: "Asset depreciation"
//     },
//   ]

//   // Fetch account types to link
//   const accountTypes = await prisma.accountType.findMany()
//   const accountTypeMap = accountTypes.reduce((acc, type) => {
//     acc[type.name] = type.id
//     return acc
//   }, {})

//   // Build data with correct accountTypeId
//   const coaData = coaTemplate.map(acc => ({
//     businessId,
//     accountCode: acc.code,
//     accountName: acc.name,
//     accountTypeId: accountTypeMap[acc.type],
//     description: acc.description,
//     isActive: true,
//     isDebit: ['Asset', 'Expense'].includes(acc.type),
//   }))

//   // Insert into database
//   await prisma.chartOfAccounts.createMany({ data: coaData })

//   //revalidatePath(`/accounting/accounts?businessId=${businessId}`)

//   console.log(`Seeded ${coaData.length} OHADA-compliant chart of accounts`)
//   return true
// }
