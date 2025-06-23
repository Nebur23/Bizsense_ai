import { getChartOfAccounts } from "@/actions/accounting/chartOfAccounts";
import AddAccountDialog from "@/components/accounting/accounts/AddAccountDialog";
import ChartOfAccountsTable from "@/components/accounting/accounts/ChartOfAccountsTable";
import { ExportCOAButton } from "@/components/accounting/accounts/ExportCOAButton";
import { ImportCOADialog } from "@/components/accounting/accounts/ImportCOADialog";

import LoaderSM from "@/components/ui/loader-sm";
import { Suspense } from "react";

export default async function ChartOfAccountsPage() {
  const data = await getChartOfAccounts();

  return (
    <div className='space-y-6 p-6 mt-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Chart of Accounts</h1>

        <div className='flex gap-2'>
          <ImportCOADialog businessId='business-1' />
          <ExportCOAButton coaData={data} />
          <AddAccountDialog />
        </div>
      </div>

      <Suspense fallback={<LoaderSM />}>
        <ChartOfAccountsTable data={data} />
      </Suspense>
    </div>
  );
}
