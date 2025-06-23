import { BulkPaymentForm } from "@/components/accounting/payments/BulkPaymentForm";


export default function BulkPaymentPage() {
  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Apply Payment to Multiple Invoices</h1>

      <BulkPaymentForm />
    </div>
  );
}
