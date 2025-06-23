import { DataTable } from "@/components/ui/data-table";
import { getInvoices } from "@/actions/accounting/invoices";
import { columns } from "./invoice-columns";
import { ExportInvoicesButton } from "./ExportInvoicesButton";

export async function InvoiceTable() {
  const data = await getInvoices();
  //const customers = await getCustomers();

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>

        <ExportInvoicesButton invoices={data} />
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );

  //   return (
  //     <div className='space-y-6'>
  //       <InvoiceFilters
  //         customers={customers}
  //         onFilterChange={filters => {
  //           // Handle filtering logic here
  //           console.log("Filters applied:", filters);
  //         }}
  //       />

  //       <DataTable columns={columns} data={data} />
  //     </div>
  //   );
}
