import { AddPurchaseInvoiceDialog } from "@/components/accounting/purchase-invoices/AddPurchaseInvoiceDialog";

export default function PurchaseInvoicesPage() {
  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Purchase Invoices</h1>
        <AddPurchaseInvoiceDialog />
      </div>

      {/* Table will go here */}
    </div>
  );
}
