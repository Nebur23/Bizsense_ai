import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { EditAccountDialog } from "./EditAccountDialog";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { toast } from "sonner";

export type ChartOfAccounts = {
  id: string;
  code: string;
  name: string;
  type: string;
  typeId: number;
  balance: number;
};

export const columns: ColumnDef<ChartOfAccounts>[] = [
  {
    accessorKey: "code",
    header: "Code",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "name",
    header: "Account Name",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant='outline'>{row.getValue("type")}</Badge>,
    meta: {
      filterVariant: "select",
    },
  },
  {
    accessorKey: "balance",
    header: "Balance (XAF)",
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balance"));
      return (
        <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
          {formatCurrency(balance, "XAF")}
        </span>
      );
    },
    meta: {
      filterVariant: "range",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <div className='flex gap-2'>
          <EditAccountDialog
            accountId={account.id}
            defaultValues={{
              accountCode: account.code,
              accountName: account.name,
              accountTypeId: account.typeId, // Replace with real data
            }}
            onSuccess={() => {
              toast.success("Account updated successfully");
            }}
          />
          <DeleteAccountButton
            accountId={account.id}
            accountName={account.name}
            onSuccess={() => {
              toast.success("Account deleted successfully");
            }}
          />
        </div>
      );
    },
  },
];
