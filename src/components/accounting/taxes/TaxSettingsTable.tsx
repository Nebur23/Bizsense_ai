// src/app/(protected)/accounting/taxes/components/TaxSettingsTable.tsx

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./tax-columns";

type TaxType = {
  id: string;
  code: string;
  name: string;
  authority: string;
  rate: number;
  status: string;
};

interface Props {
  data: TaxType[];
}

export function TaxSettingsTable({ data }: Props) {
  return <DataTable columns={columns} data={data} />;
}
