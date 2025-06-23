"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DeleteTaxTypeButton } from "./DeleteTaxTypeButton";
import { EditTaxTypeDialog } from "./EditTaxTypeDialog";
import { toast } from "sonner";

export type TaxType = {
  id: string;
  name: string;
  code: string;
  rate: number;
  authority: string;
  status: string;
};

export const columns: ColumnDef<TaxType>[] = [
  {
    accessorKey: "name",
    header: "Tax Name",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "code",
    header: "Tax Code",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "rate",
    header: "Rate (%)",
    cell: ({ row }) => `${parseFloat(row.getValue("rate")).toFixed(2)}%`,
    meta: {
      filterVariant: "range",
    },
  },
  {
    accessorKey: "authority",
    header: "Authority",
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.getValue("authority")}</Badge>
    ),
    meta: {
      filterVariant: "select",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("status") === "Active" ? "default" : "destructive"
        }
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const taxType = row.original;

      return (
        <div className='flex gap-2'>
          <EditTaxTypeDialog
            taxId={taxType.id}
            defaultValues={{
              name: taxType.name,
              code: taxType.code,
              rate: taxType.rate,
              authority: taxType.authority,
            }}
            onSuccess={() => {
              toast.success("Tax type updated successfully");
            }}
          />
          <DeleteTaxTypeButton
            taxTypeId={taxType.id}
            taxName={taxType.name}
            onSuccess={() => {
              toast.success("Tax type deleted successfully");
            }}
          />
        </div>
      );
    },
  },
];
