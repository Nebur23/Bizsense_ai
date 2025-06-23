/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { cache } from "react";
import { getAccountBalance } from "./helper";

export type ChartOfAccounts = {
  id: string;
  code: string;
  name: string;
  type: string;
  typeId: number;
  balance: number;
};

interface CreateAccountData {
  accountCode: string;
  accountName: string;
  accountTypeId: number;
  parentAccountId?: string | null;
  description?: string;
  isActive?: boolean;
}

interface UpdateChartOfAccountData {
  accountName?: string;
  accountTypeId?: number;
  parentAccountId?: string | null;
  description?: string;
  isActive?: boolean;
}

export interface AccountTypeOption {
  id: number;
  name: string;
}

//Get
export async function getChartOfAccounts(): Promise<ChartOfAccounts[]> {
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
    const accounts = await prisma.chartOfAccounts.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        businessId,
      },
      include: {
        accountType: true,
        journalEntryLines: true,
      },
      orderBy: {
        accountCode: "asc",
      },
    });

    // return accounts.map(acc => {
    //   // Calculate balance based on journal entry lines
    //   const totalDebit = acc.journalEntryLines.reduce(
    //     (sum, line) => sum + line.debitAmount,
    //     0
    //   );
    //   const totalCredit = acc.journalEntryLines.reduce(
    //     (sum, line) => sum + line.creditAmount,
    //     0
    //   );

    //   let balance = 0;
    //   if (
    //     acc.accountType.name === "Asset" ||
    //     acc.accountType.name === "Expense"
    //   ) {
    //     balance = totalDebit - totalCredit;
    //   } else {
    //     balance = totalCredit - totalDebit;
    //   }

    //   return {
    //     id: acc.id,
    //     code: acc.accountCode,
    //     name: acc.accountName,
    //     type: acc.accountType.name,
    //     typeId: acc.accountType.id,
    //     balance,
    //   };
    // });

    const accountsWithBalances = await Promise.all(
      accounts.map(async acc => {
        const balance = await getAccountBalance(acc.id, undefined);
        return {
          id: acc.id,
          code: acc.accountCode,
          name: acc.accountName,
          type: acc.accountType.name,
          typeId: acc.accountType.id,
          balance: balance,
        };
      })
    );

    return accountsWithBalances;
  } catch (error) {
    console.error("Error fetching chart of accounts:", error);
    throw new Error("Failed to fetch chart of accounts");
  }
}

export async function getChartOfAccountFull() {
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

    const businessId = user.organizationId;

    const accounts = await prisma.chartOfAccounts.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        businessId,
      },
      include: {
        accountType: true,
        parentAccount: true,
        journalEntryLines: true,
      },
      orderBy: {
        accountCode: "asc",
      },
    });

    return accounts;
  } catch (error) {
    console.error("Error fetching chart of accounts:", error);
    throw new Error("Failed to fetch chart of accounts");
  }
}

export const getAccountTypes = cache(async (): Promise<AccountTypeOption[]> => {
  try {
    const accountTypes = await prisma.accountType.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return accountTypes;
  } catch (error) {
    console.error("Error fetching account types:", error);
    throw new Error("Failed to fetch account types");
  }
});
//Create
export async function createAccount(data: CreateAccountData): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    businessId: string;
    accountCode: string;
    accountName: string;
    accountTypeId: number;
    parentAccountId: string | null;
    description: string | null;
    isDebit: boolean;
    isActive: boolean;
    isDeleted: boolean;
  };
  error?: Error;
}> {
  try {
    console.log("Creating account:", data);
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

    if (data.parentAccountId) {
      const parentAccount = await prisma.chartOfAccounts.findUnique({
        where: {
          id: data.parentAccountId,
          businessId,
          isDeleted: false,
        },
      });

      if (!parentAccount) {
        throw new Error(
          "Parent account not found or doesn't belong to your business"
        );
      }
    }

    const accountType = await prisma.accountType.findUnique({
      where: { id: data.accountTypeId },
    });

    if (!accountType) {
      throw new Error("Invalid account type");
    }

    const existingAccount = await prisma.chartOfAccounts.findFirst({
      where: {
        businessId,
        accountCode: data.accountCode,
      },
    });

    if (existingAccount) {
      if (existingAccount.isDeleted) {
        // Option 1: Restore the record
        await prisma.chartOfAccounts.update({
          where: { id: existingAccount.id },
          data: {
            isDeleted: false,
            isActive: true,
            accountName: data.accountName,
            accountTypeId: data.accountTypeId,
            description: data.description || "",
            isDebit:
              accountType.name === "Asset" || accountType.name === "Expense",
          },
        });
        return {
          success: true,
          message: "Account created successfully",
          data: existingAccount,
        };
      } else {
        // Option 2: Already active

        return {
          success: false,
          message: "An active account with this code already exists.",
        };
      }
    }

    const newAccount = await prisma.$transaction(async prisma => {
      const account = await prisma.chartOfAccounts.create({
        data: {
          accountCode: data.accountCode,
          accountName: data.accountName,
          accountTypeId: data.accountTypeId,
          parentAccountId: data.parentAccountId || null,
          businessId,
          description: data.description || "",
          isActive: data.isActive ?? true,
          isDebit:
            accountType.name === "Asset" || accountType.name === "Expense",
        },
        include: {
          accountType: true,
        },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "CREATE",
          tableName: "ChartOfAccounts",
          recordId: account.id,
          newValues: JSON.stringify(account),
        },
      });

      return account;
    });

    // 8. Revalidate paths that might be affected
    //revalidatePath("/accounting/accounts");
    //revalidatePath("/api/accounts"); // If you have API routes

    return {
      success: true,
      message: "Account created successfully",
      data: newAccount,
    };
  } catch (error: any) {
    console.error("Error in createAccount:", error);
    return {
      success: false,
      message: error.message || "Failed to create account",
      error: error,
    };
  }
}
//Update
export async function updateChartOfAccount(
  accountId: string,
  data: UpdateChartOfAccountData
) {
  try {
    // 1. Authentication and Authorization
    console.log("update cao:", data, accountId);
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

    const businessId = user.organizationId;

    // 3. Validate permissions
    // if (!["OWNER", "ADMIN"].includes(user.role)) {
    //   throw new Error("Unauthorized: Insufficient permissions");
    // }

    // 4. Get existing account
    const existingAccount = await prisma.chartOfAccounts.findUnique({
      where: { id: accountId, businessId },
    });

    if (!existingAccount) {
      return {
        success: false,
        message: "Account not found or doesn't belong to your business",
      };
    }

    // 5. Validate parent account if changing
    if (data.parentAccountId !== undefined) {
      if (data.parentAccountId) {
        const parentAccount = await prisma.chartOfAccounts.findUnique({
          where: {
            id: data.parentAccountId,
            businessId,
            isDeleted: false,
          },
        });
        if (!parentAccount) {
          return {
            success: false,
            message:
              "Parent account not found or doesn't belong to your business",
          };
        }
      }
    }

    // 6. Update in transaction
    const updatedAccount = await prisma.$transaction(async prisma => {
      const account = await prisma.chartOfAccounts.update({
        where: { id: accountId },
        data: {
          accountName: data.accountName,
          accountTypeId: data.accountTypeId,
          parentAccountId: data.parentAccountId,
          description: data.description,
          isActive: data.isActive,
          ...(data.accountTypeId && {
            isDebit: await isDebitAccountType(data.accountTypeId),
          }),
        },
        include: { accountType: true },
      });

      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "UPDATE",
          tableName: "ChartOfAccounts",
          recordId: accountId,
          oldValues: JSON.stringify(existingAccount),
          newValues: JSON.stringify(account),
        },
      });

      return account;
    });

    // revalidatePaths(["/accounting/accounts", "/api/accounts"]);

    return {
      success: true,
      message: "Account updated successfully",
      data: updatedAccount,
    };
  } catch (error: any) {
    console.error("Error updating account:", error);
    return {
      success: false,
      message: error.message || "Failed to update account",
      error: error,
    };
  }
}
//Delete
export async function deleteChartOfAccount(accountId: string) {
  try {
    console.log("DELETE COA-accountID", accountId);
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

    const businessId = user.organizationId;

    // Check if account has transactions
    const hasTransactions =
      (await prisma.journalEntryLine.count({
        where: { accountId },
      })) > 0;

    if (hasTransactions) {
      return {
        success: false,
        message: "Cannot delete account with existing transactions",
      };
    }

    // Soft delete
    const deletedAccount = await prisma.$transaction(async prisma => {
      const account = await prisma.chartOfAccounts.update({
        where: { id: accountId, businessId },
        data: { isActive: false, isDeleted: true },
      });

      await prisma.auditLog.create({
        data: {
          businessId,
          userId,
          action: "DELETE",
          tableName: "ChartOfAccounts",
          recordId: accountId,
          oldValues: JSON.stringify(account),
        },
      });

      return account;
    });

    // revalidatePaths(["/accounting/accounts"]);

    return {
      success: true,
      message: "Account deleted successfully",
      data: deletedAccount,
    };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      message: error.message || "Failed to delete account",
      error: error,
    };
  }
}

// Helper function t
async function isDebitAccountType(accountTypeId: number): Promise<boolean> {
  const type = await prisma.accountType.findUnique({
    where: { id: accountTypeId },
  });
  return type ? ["Asset", "Expense"].includes(type.name) : true;
}
// export function getAccountTypeCategory(id: number): string {
//   // Define your categorization logic
//   const categories: Record<number, string> = {
//     1: "Balance Sheet",
//     2: "Balance Sheet",
//     3: "Balance Sheet",
//     4: "Income Statement",
//     5: "Income Statement",
//   };

//   return categories[id] || "Other";
// }
