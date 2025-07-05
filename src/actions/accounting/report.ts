"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

interface AgingReportEntry {
  customer: string;
  totalDue: number;
  current: number;
  days1To30: number;
  days31To60: number;
  days61Plus: number;
}

export async function getAgingReport() {
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
  const today = new Date();
  const invoices = await prisma.invoice.findMany({
    where: {
      businessId,
      status: { not: "Paid" },
      dueDate: { lte: today },
    },
    include: {
      customer: true,
    },
  });

  const report: Record<string, AgingReportEntry> = {};

  for (const inv of invoices) {
    const customerId = inv.customerId;
    const customerName = inv.customer.name;
    const daysOverdue = Math.floor(
      (today.getTime() - new Date(inv.dueDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const key = `${customerId}-${customerName}`;
    const balance = inv.totalAmount - inv.paidAmount;

    if (!report[key]) {
      report[key] = {
        customer: customerName,
        totalDue: 0,
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61Plus: 0,
      };
    }

    report[key].totalDue += balance;

    if (daysOverdue <= 30) {
      report[key].current += balance;
    } else if (daysOverdue <= 60) {
      report[key].days1To30 += balance;
    } else if (daysOverdue <= 90) {
      report[key].days31To60 += balance;
    } else {
      report[key].days61Plus += balance;
    }
  }

  return Object.values(report);
}

export async function getReceivablesSummary() {
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
  const invoices = await prisma.invoice.findMany({
    where: {
      businessId,
      //status: { not: "Paid" },
      // dueDate: { lte: new Date() },
    },
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  const overdue = invoices.filter(
    inv => inv.dueDate < new Date() && inv.balance > 0 && inv.status !== "Paid"
  );
  const overdueCount = overdue.length;

  //console.log("receivable invoices", invoices);

  return {
    total,
    overdueCount,
    overdueInvoices: overdue.slice(0, 3).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      status: inv.status,
      balance: inv.balance,
      dueDate: inv.dueDate,
    })),
    invoices,
  };
}

export async function getPayablesSummary() {
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
  const purchaseInvoices = await prisma.purchaseInvoice.findMany({
    where: {
      businessId,
      status: { not: "Paid" },
      dueDate: { lte: new Date() },
    },
  });

  const total = purchaseInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const overdue = purchaseInvoices.filter(
    inv => inv.dueDate < new Date() && inv.balance > 0
  );
  const overdueCount = overdue.length;

  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      // paymentType: "Payment",
      paymentDate: { lte: new Date() },
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return {
    total,
    overdueCount,
    payments: payments.slice(0, 3).map(inv => ({
      id: inv.id,
      paymentNumber: inv.paymentNumber,
      method: inv.paymentMethod,
      amount: inv.amount,
      paymentDate: inv.paymentDate,
      type: inv.paymentType,
    })),
  };
}

// export async function getCashFlowData() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) throw new Error("Unauthorized");

//   const userId = session.user.id;
//   const user = await prisma.member.findFirst({
//     where: { userId },
//   });

//   if (!user || !user.organizationId) {
//     throw new Error("User businessId not found");
//   }
//   const businessId = user.organizationId;
//   const today = new Date();
//   const nextMonth = new Date(today);
//   nextMonth.setMonth(nextMonth.getMonth() + 1);

//   // Get unpaid invoices (Receivables)
//   const receivables = await prisma.invoice.findMany({
//     where: {
//       businessId,
//       dueDate: { lte: nextMonth },
//       status: { not: "Paid" },
//     },
//     select: {
//       dueDate: true,
//       balance: true,
//     },
//   });

//   // Get pending payments (Payables)
//   const payables = await prisma.payment.findMany({
//     where: {
//       businessId,
//       paymentType: "Payment",
//       paymentDate: { lte: nextMonth },
//     },
//     select: {
//       paymentDate: true,
//       amount: true,
//     },
//   });

//   // Group by week
//   interface GroupedData {
//     [key: string]: { date: string; receivables: number; payables: number };
//   }
//   const groupedData: GroupedData = {};

//   [
//     ...receivables,
//     ...payables.map(p => ({ dueDate: p.paymentDate, balance: -p.amount })),
//   ]
//     .filter(Boolean)
//     .forEach(item => {
//       const key = format(new Date(item.dueDate), "yyyy-MM-dd");
//       if (!groupedData[key]) {
//         groupedData[key] = { date: key, receivables: 0, payables: 0 };
//       }

//       if (item.balance > 0) {
//         groupedData[key].receivables += item.balance;
//       } else {
//         groupedData[key].payables -= item.balance;
//       }
//     });

//   return Object.values(groupedData).sort((a, b) =>
//     a.date.localeCompare(b.date)
//   );
// }

export async function getCashFlowChartData() {
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
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(nextMonth.getDate() + 30);

  // Get unpaid invoices (Receivables)
  const receivables = await prisma.invoice.findMany({
    where: {
      businessId,
      dueDate: { lte: nextMonth },
      status: { not: "Paid" },
    },
    select: {
      dueDate: true,
      balance: true,
    },
  });

  // Get upcoming payments (Payables)
  const payables = await prisma.payment.findMany({
    where: {
      businessId,
      paymentDate: { gte: today, lte: nextMonth },
    },
    select: {
      paymentDate: true,
      amount: true,
      paymentType: true,
    },
  });

  interface DailyData {
    date: string;
    receivables: number;
    payables: number;
    net: number;
  }

  // Group by day
  const groupedData: Record<string, DailyData> = {};

  // Add receivables
  for (const inv of receivables) {
    const key = inv.dueDate.toISOString().split("T")[0];
    if (!groupedData[key]) {
      groupedData[key] = { date: key, receivables: 0, payables: 0, net: 0 };
    }
    groupedData[key].receivables += inv.balance;
  }

  // Add payables
  for (const pay of payables) {
    const key = pay.paymentDate.toISOString().split("T")[0];
    if (!groupedData[key]) {
      groupedData[key] = { date: key, receivables: 0, payables: 0, net: 0 };
    }
    groupedData[key].payables += pay.amount;
  }

  // Calculate net flow
  const result = Object.values(groupedData)
    .map(d => ({
      ...d,
      net: d.receivables - d.payables,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}
