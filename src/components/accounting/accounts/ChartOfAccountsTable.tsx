"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./chart-of-accounts-columns";

type ChartOfAccounts = {
  id: string;
  code: string;
  name: string;
  type: string;
  typeId: number;
  balance: number;
};

interface Props {
  data: ChartOfAccounts[];
}

export default function ChartOfAccountsTable({ data }: Props) {
  return <DataTable columns={columns} data={data} />;
}
