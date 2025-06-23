// src/app/(protected)/accounting/taxes/page.tsx

import { getTaxTypes } from "@/actions/accounting/taxes";
import { AddTaxTypeDialog } from "@/components/accounting/taxes/AddTaxTypeDialog";
import { TaxSettingsTable } from "@/components/accounting/taxes/TaxSettingsTable";
import LoaderSM from "@/components/ui/loader-sm";
import { Suspense } from "react";

export default async function TaxSettingsPage() {
  const data = await getTaxTypes();
  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Tax Settings</h1>
        <AddTaxTypeDialog />
      </div>

      <Suspense fallback={<LoaderSM />}>
        <TaxSettingsTable data={data} />
      </Suspense>
    </div>
  );
}
