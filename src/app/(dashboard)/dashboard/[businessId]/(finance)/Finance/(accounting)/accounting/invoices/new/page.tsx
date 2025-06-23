import { getCustomers } from "@/actions/accounting/customers";
import { getTaxTypes } from "@/actions/accounting/taxes";
import { getProducts } from "@/actions/inventory/Products";
import { AddInvoiceForm } from "@/components/accounting/invoices/AddInvoiceForm";



export default async function CreateInvoicePage() {
   const [customers, products, taxTypes] = await Promise.all([
     getCustomers(),
     getProducts(),
     getTaxTypes(),
   ]);

  return (
    <div className='p-6 max-w-6xl mx-auto mt-10'>
      <h1 className='text-2xl font-semibold mb-6'>Create New Invoice</h1>
      <AddInvoiceForm
        customers={customers}
        products={products}
        taxTypes={taxTypes}
      />
    </div>
  );
}
