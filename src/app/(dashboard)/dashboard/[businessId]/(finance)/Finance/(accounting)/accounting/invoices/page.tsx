//import { AddInvoiceDialog } from "@/components/accounting/invoices/AddInvoiceDialog";
import { InvoiceTable } from "@/components/accounting/invoices/InvoiceTable";
//import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvoicesPage() {
  return (
    <div className='space-y-6 p-6 mt-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Invoices</h1>
        {/* <AddInvoiceDialog /> */}

        <Link
          href='invoices/new'
          className='text-sm text-blue-600 hover:underline'
        >
          + Add New Invoice
        </Link>

        {/* <Button asChild variant='outline'>
          <Link href={`payments/bulk-payments?customerId=${1}`}>
            Apply Bulk Payment
          </Link>
        </Button> */}
      </div>
      <InvoiceTable />
    </div>
  );
}
