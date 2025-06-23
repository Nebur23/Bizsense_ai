// components/accounting/ReceiptPrintView.tsx

import { Button } from "@/components/ui/button";

interface Invoice {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  totalAmount: number;
}

export function ReceiptPrintView({ invoice }: { invoice: Invoice }) {
  return (
    <div className='p-6 max-w-xl mx-auto'>
      <div className='border rounded-lg p-4'>
        <h1 className='text-2xl font-bold text-center'>RECEIPT</h1>
        <p className='text-sm text-right mt-2'>#{invoice.invoiceNumber}</p>

        <div className='mt-4'>
          <p>
            <strong>Date:</strong> {invoice.invoiceDate.toDateString()}
          </p>
          <p>
            <strong>Customer:</strong> {invoice.customerName}
          </p>
        </div>

        <table className='w-full mt-4'>
          <thead>
            <tr>
              <th className='text-left'>Description</th>
              <th className='text-right'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td className='text-right'>
                  {item.amount.toLocaleString()} XAF
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>Total</strong>
              </td>
              <td className='text-right'>
                <strong>{invoice.totalAmount.toLocaleString()} XAF</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className='mt-6 flex justify-end'>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>
    </div>
  );
}
