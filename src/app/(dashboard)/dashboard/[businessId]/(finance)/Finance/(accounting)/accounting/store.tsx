import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

// Mock Data
const recentInvoices = [
  { id: "INV-001", customer: "John Doe", amount: 238500, status: "Sent" },
  { id: "INV-002", customer: "Jane Smith", amount: 150000, status: "Paid" },
  { id: "INV-003", customer: "ABC Ltd", amount: 450000, status: "Overdue" },
];

const recentPayments = [
  { id: "PAY-001", type: "Receipt", amount: 238500, method: "Mobile Money" },
  { id: "PAY-002", type: "Payment", amount: 150000, method: "Bank Transfer" },
  { id: "PAY-003", type: "Receipt", amount: 450000, method: "Cash" },
];

export default function AccountingDashboard() {
  return (
    <div className='p-6 space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>XAF 838,500</div>
            <p className='text-xs text-muted-foreground'>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Payables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>XAF 650,000</div>
            <p className='text-xs text-muted-foreground'>+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>XAF 1,238,500</div>
            <p className='text-xs text-muted-foreground'>+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>XAF 750,000</div>
            <p className='text-xs text-muted-foreground'>-3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <ScrollArea className='h-[300px] px-4'>
            <div className='space-y-4'>
              {recentInvoices.map(invoice => (
                <div key={invoice.id} className='border-b pb-2'>
                  <div className='flex justify-between'>
                    <Link
                      href={`/accounting/invoices/${invoice.id}`}
                      className='font-medium hover:underline'
                    >
                      {invoice.id}
                    </Link>
                    <span
                      className={`text-sm ${
                        invoice.status === "Paid"
                          ? "text-green-600"
                          : invoice.status === "Overdue"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {invoice.customer}
                  </p>
                  <p className='text-sm font-semibold mt-1'>
                    XAF {invoice.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <ScrollArea className='h-[300px] px-4'>
            <div className='space-y-4'>
              {recentPayments.map(payment => (
                <div key={payment.id} className='border-b pb-2'>
                  <div className='flex justify-between'>
                    <Link
                      href={`/accounting/payments/${payment.id}`}
                      className='font-medium hover:underline'
                    >
                      {payment.id}
                    </Link>
                    <span className='text-sm'>{payment.type}</span>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {payment.method}
                  </p>
                  <p className='text-sm font-semibold mt-1'>
                    XAF {payment.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
