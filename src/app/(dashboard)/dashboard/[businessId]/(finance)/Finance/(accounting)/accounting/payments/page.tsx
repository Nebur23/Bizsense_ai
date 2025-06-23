import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/accounting/payments/payment-columns";
import { getPayments } from "@/actions/accounting/payments";

export default async function PaymentsPage() {
  const data = await getPayments();

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Payments</h1>

        <Link href='payments/new'>
          <Button>Add New Payment</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
