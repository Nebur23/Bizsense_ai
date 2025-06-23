import { AddPaymentForm } from "@/components/accounting/payments/AddPaymentForm";


export default function NewPaymentPage() {
  return (
    <div className='px-6'>
      <div className='space-y-6 max-w-xl mx-auto p-6 rounded-lg '>
        <h1 className='text-2xl font-bold gradient-title'>Record Payment</h1>
        <p className='text-muted-foreground'>
          Use this form to record a new payment transaction. Ensure all details
          are accurate before submitting.
        </p>
        <AddPaymentForm />
      </div>
    </div>
  );
}
