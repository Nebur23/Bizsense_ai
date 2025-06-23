import { getInvoice } from "@/actions/accounting/invoices";
import { InvoiceDetails } from "@/components/accounting/invoices/InvoiceDetails";
import { InvoiceStatusDialog } from "@/components/accounting/invoices/InvoiceStatusDialog";
import { PdfExportButton } from "@/components/accounting/invoices/PdfExportButton";
import { RecurringInvoiceDialog } from "@/components/accounting/invoices/RecurringInvoiceDialog";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  //const statusHistory = await getInvoiceStatusHistory(params.id);

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Invoice #{invoice.invoiceNumber}</h1>
        <div className='space-x-2'>
          <RecurringInvoiceDialog
            invoiceId={invoice.id}
            currentIsRecurring={invoice.isRecurring}
            currentRecurringType={invoice.recurringType}
          />
          <InvoiceStatusDialog
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          <PdfExportButton invoice={invoice} />
          <Link href='#' className='text-sm text-blue-600 hover:underline'>
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Display recurrence info */}
      {invoice.isRecurring && (
        <Card className='p-4 bg-blue-50 border-l-4 border-blue-500'>
          <p className='text-sm'>
            This invoice recurs every {invoice?.recurringType?.toLowerCase()}.
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            Next due: {invoice.nextDueDate ? new Date(invoice.nextDueDate).toLocaleDateString() : 'Not set'}
          </p>
        </Card>
      )}

      <div className='printable-area'>
        <InvoiceDetails invoice={invoice} />
      </div>

      {/* <Card className='p-6'>
        <h3 className='font-medium mb-4'>Status History</h3>
        <div className='space-y-2'>
          {statusHistory.map(log => (
            <div key={log.id} className='flex justify-between text-sm'>
              <span>
                {log.oldStatus} → {log.newStatus}
              </span>
              <span className='text-muted-foreground'>
                {format(new Date(log.changedAt), "PPP")}
              </span>
            </div>
          ))}
        </div>
      </Card> */}
    </div>
  );
}
