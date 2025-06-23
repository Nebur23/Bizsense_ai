"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getAiCashFlowPredictions() {
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
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Load recent invoices and payments
    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          businessId,
          dueDate: { lte: nextWeek },
          status: { notIn: ["Paid", "Cancelled"] },
        },
        include: { customer: true },
      }),
      prisma.payment.findMany({
        where: {
          businessId,
          paymentDate: { gte: today, lte: nextWeek },
        },
        include: { supplier: true },
      }),
    ]);

    interface Payment {
      type: string;
      date: string;
      amount: number;
      description: string;
    }

    // Forecast upcoming payments
    const forecast = {
      netCashFlow: 0,
      upcomingPayments: [] as Payment[],
    };

    const upcomingReceivables = invoices.filter(inv => inv.dueDate <= nextWeek);
    const upcomingPayables = payments.filter(
      pay => pay.paymentType === "Payment"
    );

    // Add receivables
    upcomingReceivables.forEach(inv => {
      forecast.upcomingPayments.push({
        type: "Receivable",
        date: inv.dueDate.toISOString(),
        amount: inv.balance,
        description: `From ${inv.customer.name}`,
      });
    });

    // Add payables
    upcomingPayables.forEach(pay => {
      forecast.upcomingPayments.push({
        type: "Payable",
        date: pay.paymentDate.toISOString(),
        amount: -pay.amount,
        description: `To ${pay.supplier?.supplierName || "Unknown"}`,
      });
    });

    forecast.netCashFlow = forecast.upcomingPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Detect overdue invoices
    const alerts = [];

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        businessId,
        status: "Overdue",
      },
      select: {
        id: true,
        invoiceNumber: true,
        balance: true,
        dueDate: true,
      },
    });

    if (overdueInvoices.length > 0) {
      alerts.push({
        message: `${overdueInvoices.length} overdue invoices found`,
        confidence: 0.92,
      });
    }

    return {
      success: true,
      forecast,
      alerts,
    };
  } catch (error) {
    console.error("Failed to load AI predictions:", error);
    return {
      success: false,
      forecast: null,
      alerts: [],
    };
  }
}
