// src/app/(protected)/accounting/purchase-invoices/page.tsx

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AddPurchaseInvoiceDialog } from "@/components/accounting/purchase-invoices/AddPurchaseInvoiceDialog";
import { Badge } from "@/components/ui/badge";
import { getPurchaseInvoices } from "@/actions/accounting/purchase-invoice";

export default async function PurchaseInvoicesPage() {
  const invoices = await getPurchaseInvoices();

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Purchase Invoices</h1>
        <AddPurchaseInvoiceDialog />
      </div>

      <Card className='overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2 text-left'>Supplier</th>
              <th className='px-4 py-2 text-left'>Invoice #</th>
              <th className='px-4 py-2 text-right'>Due Date</th>
              <th className='px-4 py-2 text-right'>Total</th>
              <th className='px-4 py-2 text-right'>Paid</th>
              <th className='px-4 py-2 text-right'>Balance</th>
              <th className='px-4 py-2 text-right'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {invoices.map(inv => (
              <tr key={inv.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2 text-sm'>
                  {inv.supplier?.supplierName}
                </td>
                <td className='px-4 py-2 text-sm'>
                  <Link
                    href={`/accounting/purchase-invoices/${inv.id}`}
                    className='hover:underline'
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className='px-4 py-2 text-sm text-right'>
                  {new Date(inv.dueDate).toLocaleDateString()}
                </td>
                <td className='px-4 py-2 text-sm text-right'>
                  {formatCurrency(inv.totalAmount)} XAF
                </td>
                <td className='px-4 py-2 text-sm text-right'>
                  {formatCurrency(inv.paidAmount)} XAF
                </td>
                <td className='px-4 py-2 text-sm text-right font-medium'>
                  {formatCurrency(inv.balance)} XAF
                </td>
                <td className='px-4 py-2 text-right'>
                  <Badge
                    variant={
                      inv.status === "Pending"
                        ? "outline"
                        : inv.status === "Approved"
                          ? "secondary"
                          : inv.status === "Paid"
                            ? "default"
                            : "destructive"
                    }
                  >
                    {inv.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
