// src/app/(protected)/accounting/dashboard/page.tsx

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  getReceivablesSummary,
  getPayablesSummary,
} from "@/actions/accounting/report";
import { getAiCashFlowPredictions } from "@/actions/accounting/ai";
import { Badge } from "@/components/ui/badge";
import CashFlowForecast from "@/components/common/CashFlowLine";

export default async function AccountingDashboardPage() {
  const [receivables, payables, aiPredictions] =
    await Promise.all([
      getReceivablesSummary(),
      getPayablesSummary(),
      getAiCashFlowPredictions(),
    ]);

  return (
    <div className='p-6 space-y-6 mt-10'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Accounting Dashboard</h1>
        {/* <div className='space-x-2'>
          <Link
            href='/accounting/invoices'
            className='text-sm text-blue-600 hover:underline'
          >
            View All Invoices →
          </Link>
          <Link
            href='/accounting/payments'
            className='text-sm text-blue-600 hover:underline'
          >
            View All Payments →
          </Link>
        </div> */}
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Total Receivables */}
        <Card className='p-4'>
          <h3 className='text-sm font-medium'>Total Receivables</h3>
          <p className='text-2xl font-bold text-green-600'>
            {formatCurrency(receivables.total)}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {receivables.overdueCount} overdue
          </p>
        </Card>

        {/* Total Payables */}
        <Card className='p-4'>
          <h3 className='text-sm font-medium'>Total Payables</h3>
          <p className='text-2xl font-bold text-red-600'>
            {formatCurrency(payables.total)}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {payables.overdueCount} overdue
          </p>
        </Card>

        {/* Net Cash Flow Forecast */}
        <Card className='p-4'>
          <h3 className='text-sm font-medium'>AI Forecast </h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(aiPredictions.forecast?.netCashFlow || 0)}
          </p>
          <p
            className={`text-xs ${
              (aiPredictions.forecast?.netCashFlow ?? 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {(aiPredictions.forecast?.netCashFlow ?? 0) >= 0
              ? "Positive Trend"
              : "Negative Trend"}
          </p>
        </Card>

        {/* Risk Alerts */}
        <Card className='p-4'>
          <h3 className='text-sm font-medium'>AI Risk Alert</h3>
          <p className='text-lg font-semibold'>
            {aiPredictions.alerts.length > 0
              ? `${aiPredictions.alerts.length} High-risk Invoices`
              : "No high-risk items"}
          </p>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      {/* <Card className='p-6'>
        <h2 className='font-semibold mb-4'>Cash Flow Forecast</h2>
        <CashFlowChart data={cashFlowData} />
      </Card> */}
        <CashFlowForecast />

      {/* Cash Flow Forecast Chart */}
      {/* <Card className='p-6'>
        <h2 className='font-semibold mb-4'>Cash Flow Forecast</h2>
        <div className='space-y-2'>
          {aiPredictions.forecast?.upcomingPayments.map((payment, i) => (
            <div
              key={i}
              className='flex justify-between p-3 border rounded-md bg-gray-50'
            >
              <div>
                <p className='font-medium'>{payment.type}</p>
                <p className='text-xs text-muted-foreground'>
                  {new Date(payment.date).toLocaleDateString()}
                </p>
              </div>
              <p
                className={`font-bold ${payment.amount > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {payment.amount > 0 ? "+" : ""}
                {formatCurrency(payment.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card> */}

      {/* Overdue Invoices */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='p-6'>
          <h2 className='font-semibold mb-4'>Overdue Invoices</h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left'>Invoice #</th>
                  <th className='px-4 py-2 text-right'>Due Date</th>
                  <th className='px-4 py-2 text-right'>Balance</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {receivables.overdueInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className='px-4 py-2 font-medium'>
                      <Link
                        href={`/accounting/invoices/${inv.id}`}
                        className='hover:underline'
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className='px-4 py-2 text-right text-sm'>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-2 text-right font-bold'>
                      {formatCurrency(inv.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* AI Alerts */}
        <Card className='p-6'>
          <h2 className='font-semibold mb-4'>AI Insights</h2>
          <div className='space-y-4'>
            {aiPredictions.alerts.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                No alerts detected
              </p>
            )}

            {aiPredictions.alerts.map((alert, i) => (
              <div
                key={i}
                className='border-l-4 border-yellow-400 pl-4 py-2 bg-yellow-50 rounded-md'
              >
                <p className='text-sm'>{alert.message}</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Confidence: {(alert.confidence * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Invoices */}
        <Card className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold'>Recent Invoices</h3>
            <Link
              href='accounting/invoices'
              className='text-sm text-blue-600 hover:underline'
            >
              View all
            </Link>
          </div>
          <div className='space-y-4'>
            {receivables?.invoices.map(inv => (
              <div
                key={inv.id}
                className='flex justify-between pb-3 border-b last:border-none'
              >
                <div>
                  <p className='font-medium'>{inv.invoiceNumber}</p>
                  <p className='text-sm text-muted-foreground'>
                    {inv.customer.name}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-bold'>{formatCurrency(inv.balance)} </p>
                  <Badge
                    variant={
                      inv.status === "Paid"
                        ? "default"
                        : inv.status === "Sent"
                          ? "secondary"
                          : inv.status === "Overdue"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {inv.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold'>Recent Payments</h3>
            <Link
              href='accounting/payments'
              className='text-sm text-blue-600 hover:underline'
            >
              View all
            </Link>
          </div>
          <div className='space-y-4'>
            {payables.payments.map(pay => (
              <div
                key={pay.id}
                className='flex justify-between pb-3 border-b last:border-none'
              >
                <div>
                  <p className='font-medium'>{pay.paymentNumber}</p>
                  <p className='text-sm text-muted-foreground'>{pay.method}</p>
                </div>
                <div className='text-right'>
                  <p className='font-bold'>{formatCurrency(pay.amount)} </p>
                  <p className='text-sm'>{pay.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
