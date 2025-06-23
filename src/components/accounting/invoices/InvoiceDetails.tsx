"use client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import React from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    customer: {
      name: string;
      phone?: string;
      email?: string;
    };
    items: Array<{
      productName: string ;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      lineTotal: number;
    }>;
    payments: Array<{
      paymentNumber: string;
      amount: number;
      paymentDate: string;
      method: string;
    }>;
  };
}

export function InvoiceDetails({ invoice }: Props) {
  return (
    <div className='bg-white border rounded-lg shadow-sm p-6 max-w-4xl mx-auto printable-area'>
      {/* Header */}
      <div className='flex justify-between items-start mb-8'>
        <div>
          <h2 className='text-xl font-semibold'>INVOICE</h2>
          <p className='text-sm text-muted-foreground'>
            #{invoice.invoiceNumber}
          </p>
        </div>
        <div className='text-right'>
          <Badge
            variant={
              invoice.status === "Paid"
                ? "default"
                : invoice.status === "Sent"
                  ? "secondary"
                  : invoice.status === "Overdue"
                    ? "destructive"
                    : "outline"
            }
          >
            {invoice.status}
          </Badge>
        </div>
      </div>

      {/* Customer Info */}
      <div className='mb-6'>
        <h3 className='font-medium'>Billed To:</h3>
        <p className='mt-1'>{invoice.customer.name}</p>
        {invoice.customer.phone && (
          <p className='text-sm text-muted-foreground'>
            {invoice.customer.phone}
          </p>
        )}
        {invoice.customer.email && (
          <p className='text-sm text-muted-foreground'>
            {invoice.customer.email}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className='grid grid-cols-2 gap-4 mb-6'>
        <div>
          <p className='text-sm text-muted-foreground'>Invoice Date</p>
          <p>{format(new Date(invoice.invoiceDate), "PPP")}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground'>Due Date</p>
          <p>{format(new Date(invoice.dueDate), "PPP")}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className='border rounded-md overflow-hidden mb-6'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2 text-left text-sm font-semibold'>
                Product
              </th>
              <th className='px-4 py-2 text-right text-sm font-semibold'>
                Qty
              </th>
              <th className='px-4 py-2 text-right text-sm font-semibold'>
                Unit Price
              </th>
              <th className='px-4 py-2 text-right text-sm font-semibold'>
                Tax (%)
              </th>
              <th className='px-4 py-2 text-right text-sm font-semibold'>
                Total
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className='px-4 py-2 text-sm'>{item.productName}</td>
                <td className='px-4 py-2 text-sm text-right'>
                  {item.quantity}
                </td>
                <td className='px-4 py-2 text-sm text-right'>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className='px-4 py-2 text-sm text-right'>
                  {item.taxRate}%
                </td>
                <td className='px-4 py-2 text-sm text-right'>
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className='flex justify-end mb-6'>
        <div className='w-full max-w-sm space-y-1'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className='flex justify-between'>
            <span>
              Tax (
              {invoice.taxAmount > 0
                ? ((invoice.taxAmount / invoice.subtotal) * 100).toFixed(2)
                : 0}
              %)
            </span>
            <span>{formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div className='flex justify-between font-bold pt-2 border-t'>
            <span>Total Amount</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Paid So Far</span>
            <span>{formatCurrency(invoice.paidAmount || 0)}</span>
          </div>
          <div className='flex justify-between font-semibold text-red-600'>
            <span>Balance Due</span>
            <span>{formatCurrency(invoice.balance)}</span>
          </div>
        </div>
      </div>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <>
          <h3 className='font-medium mb-2'>Payments Received</h3>
          <div className='border rounded-md overflow-hidden mb-6'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-sm font-semibold'>
                    Payment #
                  </th>
                  <th className='px-4 py-2 text-right text-sm font-semibold'>
                    Date
                  </th>
                  <th className='px-4 py-2 text-right text-sm font-semibold'>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {invoice.payments.map((payment, i) => (
                  <tr key={i}>
                    <td className='px-4 py-2 text-sm'>
                      {payment.paymentNumber}
                    </td>
                    <td className='px-4 py-2 text-sm text-right'>
                      {format(new Date(payment.paymentDate), "PPP")}
                    </td>
                    <td className='px-4 py-2 text-sm text-right'>
                      {formatCurrency(payment.amount)} XAF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Actions */}
      <div className='flex justify-end mt-6'>
        <Button variant='outline' onClick={() => window.print()}>
          Print Receipt
        </Button>
      </div>
    </div>
  );
}
