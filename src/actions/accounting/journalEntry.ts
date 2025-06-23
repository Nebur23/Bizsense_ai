/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { generateNextJournalEntryNumber } from "./helper";

//Get
export type JournalEntry = {
  id: string;
  number: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  status: "Draft" | "Posted" | "Reversed";
  businessId: string;
  lines: JournalEntryLineInput[];
};
//ByID
export type JournalEntryId = {
  id: string;
  number: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  status: "Draft" | "Posted" | "Reversed";
  businessId: string;
  reference?: string;
  lines: Array<{
    accountId: string;
    accountName: string;
    accountCode: string;
    accountType: string;
    debitAmount: number;
    creditAmount: number;
    description?: string;
    reference?: string;
  }>;
};

// types/journal-entry.ts
export interface JournalEntryLineInput {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  reference?: string;
}
//create
interface JournalEntryInput {
  transactionDate: Date;
  reference?: string;
  description?: string;
  lines: JournalEntryLineInput[];
}
//update.ts
export interface JournalEntryUpdateInput {
  transactionDate: Date;
  reference?: string;
  description?: string;
  lines: JournalEntryLineInput[];
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
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

    const [entries] = await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          isDeleted: false,
          businessId,
        },
        include: {
          lines: {
            include: {
              account: {
                select: {
                  accountCode: true,
                  accountName: true,
                  accountType: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { transactionDate: "desc" },
      }),
      //prisma.journalEntry.count({ where }),
    ]);

    //console.log("Fetched journal entries:", entries);

    return entries.map(entry => ({
      id: entry.id,
      number: entry.entryNumber,
      date: entry.transactionDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      description: entry.description || "",
      debit:
        entry.totalDebit ??
        entry.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0),
      credit:
        entry.totalCredit ??
        entry.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0),
      status: entry.status as "Draft" | "Posted" | "Reversed",
      businessId: entry.businessId,
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        debitAmount: line.debitAmount || 0,
        creditAmount: line.creditAmount || 0,
        description: line.description || "",
        reference: line.reference || "",
      })),
    }));
  } catch (error: any) {
    console.error("Error fetching journal entries:", error);
    throw new Error(`Failed to fetch journal entries: ${error.message}`);
  }
}
export async function getJournalEntryById(
  entryId: string
): Promise<JournalEntryId | null> {
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
    //     "Unauthorized: Insufficient permissions to view journal entries"
    //   );
    // }
    const businessId = user.organizationId;
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId, businessId },
      include: {
        lines: {
          include: {
            account: {
              select: {
                accountCode: true,
                accountName: true,
                accountType: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!entry || entry.isDeleted) return null;
    //console.log("Fetched journal entry:", entry);
    return {
      id: entry.id,
      number: entry.entryNumber,
      date: entry.transactionDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      description: entry.description || "",
      debit:
        entry.totalDebit ??
        entry.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0),
      credit:
        entry.totalCredit ??
        entry.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0),
      status: entry.status as "Draft" | "Posted" | "Reversed",
      businessId: entry.businessId,
      reference: entry.reference || "",
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        accountName: line.account.accountName,
        accountCode: line.account.accountCode,
        accountType: line.account.accountType.name,
        debitAmount: line.debitAmount || 0,
        creditAmount: line.creditAmount || 0,
        description: line.description || "",
        reference: line.reference || "",
      })),
    };
  } catch (error: any) {
    console.error("Error fetching journal entry by ID:", error);
    throw new Error(`Failed to fetch journal entry: ${error.message}`);
  }
}
export async function getJournalEntriesByNumber(
  entryNumber: string // e.g. "JE-00001"
): Promise<JournalEntryId | null> {
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
    //     "Unauthorized: Insufficient permissions to view journal entries"
    //   );
    // }
    const businessId = user.organizationId;
    const entry = await prisma.journalEntry.findUnique({
      where: {
        businessId_entryNumber: {
          businessId,
          entryNumber,
        },
      },
      include: {
        lines: {
          include: {
            account: {
              select: {
                accountCode: true,
                accountName: true,
                accountType: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!entry || entry.isDeleted) return null;
    console.log("Fetched journal entry by number:", entry);
    return {
      id: entry.id,
      number: entry.entryNumber,
      date: entry.transactionDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      description: entry.description || "",
      debit:
        entry.totalDebit ??
        entry.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0),
      credit:
        entry.totalCredit ??
        entry.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0),
      status: entry.status as "Draft" | "Posted" | "Reversed",
      businessId: entry.businessId,
      reference: entry.reference || "",
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        accountName: line.account.accountName,
        accountCode: line.account.accountCode,
        accountType: line.account.accountType.name,
        debitAmount: line.debitAmount || 0,
        creditAmount: line.creditAmount || 0,
        description: line.description || "",
        reference: line.reference || "",
      })),
    };
  } catch (error: any) {
    console.error("Error fetching journal entry by number:", error);
    throw new Error(`Failed to fetch journal entry: ${error.message}`);
  }
}

//create.ts
export async function createJournalEntry(data: JournalEntryInput) {
  try {
    console.log("Creating journal entry with data:", data);
    // Authentication and authorization
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

    // Validate journal entry
    await validateJournalEntry(data, businessId);

    const totalDebit = data.lines.reduce(
      (sum, line) => sum + line.debitAmount,
      0
    );
    const totalCredit = data.lines.reduce(
      (sum, line) => sum + line.creditAmount,
      0
    );

    return await prisma.$transaction(
      async prisma => {
        // 1. Create the journal entry header
        const entry = await prisma.journalEntry.create({
          data: {
            businessId,
            userId: session.user.id,
            entryNumber: await generateNextJournalEntryNumber(businessId),
            transactionDate: data.transactionDate,
            reference: data.reference,
            description: data.description,
            status: "Posted",
            totalDebit,
            totalCredit,
          },
        });

        // 2. Create all journal entry lines
        await prisma.journalEntryLine.createMany({
          data: data.lines.map(line => ({
            entryId: entry.id,
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            reference: line.reference,
          })),
        });

        // 4. Create audit log
        await prisma.auditLog.create({
          data: {
            businessId,
            userId: session.user.id,
            action: "CREATE",
            tableName: "JournalEntry",
            recordId: entry.id,
            newValues: JSON.stringify(entry),
          },
        });

        //revalidatePath(["/accounting/journal-entries", "/api/journal-entries"]);

        return {
          success: true,
          message: "Journal entry created successfully",
          data: entry,
        };
      },
      {
        maxWait: 10000, // 10 seconds max wait
        timeout: 10000, // 10 seconds timeout
      }
    );
  } catch (error: any) {
    console.error("Error creating journal entry:", error);
    return {
      success: false,
      message: error.message || "Failed to create journal entry",
      error: error,
    };
  }
}

// app/api/journal-entries/update.ts
export async function updateJournalEntry(
  entryId: string,
  data: JournalEntryUpdateInput
) {
  try {
    console.log(`updating journal entry with id ${entryId}&  data:`, data);
    // Authentication and authorization
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

    // Verify entry exists and belongs to business
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id: entryId, businessId },
      include: { lines: true },
    });

    if (!existingEntry) throw new Error("Journal entry not found");
    if (existingEntry.status === "Posted")
      throw new Error("Posted journal entries cannot be modified");

    // If lines are being updated, validate them
    if (data.lines) {
      await validateJournalEntry(
        { ...existingEntry, lines: data.lines } as JournalEntryInput,
        businessId
      );
    }

    return await prisma.$transaction(async prisma => {
      // 1. Reverse old account balances
      // for (const line of existingEntry.lines) {
      //   await prisma.chartOfAccounts.update({
      //     where: { id: line.accountId },
      //     data: {
      //       balance: {
      //         decrement: line.debitAmount - line.creditAmount
      //       }
      //     }
      //   });
      // }

      // 2. Update journal entry header
      const updatedEntry = await prisma.journalEntry.update({
        where: { id: entryId },
        data: {
          transactionDate: data.transactionDate,
          reference: data.reference,
          description: data.description,
          ...(data.lines && {
            totalDebit: data.lines.reduce(
              (sum, line) => sum + line.debitAmount,
              0
            ),
            totalCredit: data.lines.reduce(
              (sum, line) => sum + line.creditAmount,
              0
            ),
          }),
        },
      });

      // 3. If lines were updated, replace them
      if (data.lines) {
        // Delete old lines
        await prisma.journalEntryLine.deleteMany({
          where: { entryId },
        });

        // Create new lines
        await prisma.journalEntryLine.createMany({
          data: data.lines.map(line => ({
            entryId,
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            reference: line.reference,
          })),
        });

        // Update new account balances
        // for (const line of data.lines) {
        //   await prisma.chartOfAccounts.update({
        //     where: { id: line.accountId },
        //     data: {
        //       balance: {
        //         increment: line.debitAmount - line.creditAmount
        //       }
        //     }
        //   });
        // }
      }

      // 4. Create audit log
      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "UPDATE",
          tableName: "JournalEntry",
          recordId: entryId,
          oldValues: JSON.stringify(existingEntry),
          newValues: JSON.stringify(updatedEntry),
        },
      });

      //revalidatePaths(["/accounting/journal-entries", `/api/journal-entries/${entryId}`]);

      return {
        success: true,
        message: "Journal entry updated successfully",
        data: updatedEntry,
      };
    });
  } catch (error: any) {
    console.error("Error updating journal entry:", error);
    return {
      success: false,
      message: error.message || "Failed to update journal entry",
      error: error,
    };
  }
}

async function validateJournalEntry(
  data: JournalEntryInput,
  businessId: string
) {
  // Validate debit = credit
  const totalDebit = data.lines.reduce(
    (sum, line) => sum + line.debitAmount,
    0
  );
  const totalCredit = data.lines.reduce(
    (sum, line) => sum + line.creditAmount,
    0
  );

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    // Allow for rounding differences
    throw new Error(
      "Journal entry must balance (total debits must equal total credits)"
    );
  }

  // Validate all accounts belong to the business
  const accountIds = data.lines.map(line => line.accountId);
  const accounts = await prisma.chartOfAccounts.findMany({
    where: {
      id: { in: accountIds },
      businessId,
      isActive: true,
      isDeleted: false,
    },
  });

  if (accounts.length !== accountIds.length) {
    throw new Error(
      "One or more accounts are invalid or don't belong to your business"
    );
  }

  // Validate each line has either debit or credit (not both, not neither)
  for (const line of data.lines) {
    if (
      (line.debitAmount > 0 && line.creditAmount > 0) ||
      (line.debitAmount === 0 && line.creditAmount === 0)
    ) {
      throw new Error(
        "Each line must have either a debit or credit amount (not both, not zero)"
      );
    }
  }
}

// app/api/journal-entries/delete.ts
export async function reverseJournalEntry(entryId: string) {
  try {
    // Authentication and authorization
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

    // Verify entry exists and belongs to business
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id: entryId, businessId },
      include: { lines: true },
    });

    if (!existingEntry) throw new Error("Journal entry not found");
    if (existingEntry.status === "Reversed")
      throw new Error("Journal entry already reversed");

    return await prisma.$transaction(async prisma => {
      // 1. Create reversing entry
      const reversingEntry = await prisma.journalEntry.create({
        data: {
          businessId,
          userId: session.user.id,
          entryNumber: await generateNextJournalEntryNumber(businessId),
          transactionDate: new Date(),
          reference: `REV-${existingEntry.entryNumber}`,
          description: `Reversal of ${existingEntry.entryNumber}`,
          status: "Posted",
          totalDebit: existingEntry.totalCredit, // Debit and credit are swapped
          totalCredit: existingEntry.totalDebit,
        },
      });

      // 2. Create reversing lines (with amounts swapped)
      await prisma.journalEntryLine.createMany({
        data: existingEntry.lines.map(line => ({
          entryId: reversingEntry.id,
          accountId: line.accountId,
          debitAmount: line.creditAmount,
          creditAmount: line.debitAmount,
          description: line.description
            ? `Reversal: ${line.description}`
            : undefined,
          reference: line.reference,
        })),
      });

      // 3. Update account balances for reversal
      // for (const line of existingEntry.lines) {
      //   await prisma.chartOfAccounts.update({
      //     where: { id: line.accountId },
      //     data: {
      //       balance: {
      //         increment: line.creditAmount - line.debitAmount, // Reverse the original effect
      //       },
      //     },
      //   });
      // }

      // 4. Mark original entry as reversed
      await prisma.journalEntry.update({
        where: { id: entryId },
        data: { status: "Reversed" },
      });

      // 5. Create audit logs
      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "REVERSE",
          tableName: "JournalEntry",
          recordId: entryId,
          newValues: JSON.stringify({
            reversingEntryId: reversingEntry.id,
            status: "Reversed",
          }),
        },
      });

      // revalidatePaths([
      //   "/accounting/journal-entries",
      //   `/api/journal-entries/${entryId}`,
      // ]);

      return {
        success: true,
        message: "Journal entry reversed successfully",
        data: {
          originalEntryId: entryId,
          reversingEntryId: reversingEntry.id,
        },
      };
    });
  } catch (error: any) {
    console.error("Error reversing journal entry:", error);
    return {
      success: false,
      message: error.message || "Failed to reverse journal entry",
      error: error,
    };
  }
}

export async function autoCreateJournalEntry(data: JournalEntryInput) {
  try {
    console.log("Creating journal entry with data:", data);
    // Authentication and authorization
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

    // Validate journal entry
    await validateJournalEntry(data, businessId);

    const totalDebit = data.lines.reduce(
      (sum, line) => sum + line.debitAmount,
      0
    );
    const totalCredit = data.lines.reduce(
      (sum, line) => sum + line.creditAmount,
      0
    );

    // 1. Create the journal entry header
    const entry = await prisma.journalEntry.create({
      data: {
        businessId,
        userId: session.user.id,
        entryNumber: await generateNextJournalEntryNumber(businessId),
        transactionDate: data.transactionDate,
        reference: data.reference,
        description: data.description,
        status: "Posted",
        totalDebit,
        totalCredit,
      },
    });

    // 2. Create all journal entry lines
    await prisma.journalEntryLine.createMany({
      data: data.lines.map(line => ({
        entryId: entry.id,
        accountId: line.accountId,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        description: line.description,
        reference: line.reference,
      })),
    });

    // 4. Create audit log
    await prisma.auditLog.create({
      data: {
        businessId,
        userId: session.user.id,
        action: "CREATE",
        tableName: "JournalEntry",
        recordId: entry.id,
        newValues: JSON.stringify(entry),
      },
    });

    //revalidatePath(["/accounting/journal-entries", "/api/journal-entries"]);

    return {
      success: true,
      message: "Journal entry created successfully",
      data: entry,
    };
  } catch (error: any) {
    console.error("Error creating journal entry:", error);
    return {
      success: false,
      message: error.message || "Failed to create journal entry",
      error: error,
    };
  }
}
