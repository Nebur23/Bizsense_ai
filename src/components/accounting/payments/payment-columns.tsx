"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export type Payment = {
  id: string;
  paymentNumber: string;
  date: string;
  type: string;
  name: string | undefined;
  method: string;
  amount: number;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "PPP"),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "Receipt" ? "default" : "secondary"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("method") as string;
      return (
        <Badge variant='outline' className='capitalize'>
          {method.toLowerCase().replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(parseFloat(row.getValue("amount"))),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
];
