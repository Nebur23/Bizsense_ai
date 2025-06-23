"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

export type Invoice = {
  id: string;
  number: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
  businessId?: string;
};

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "number",
    header: "Invoice #",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/${row.original.businessId}/Finance/accounting/invoices/${row.original.id}`}
        className='font-medium hover:underline'
      >
        {row.getValue("number")}
      </Link>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      `${parseFloat(row.getValue("amount")).toLocaleString()} XAF`,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => format(new Date(row.getValue("dueDate")), "PPP"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            status === "Paid"
              ? "bg-green-100 text-green-800"
              : status === "Draft"
                ? "bg-slate-100 text-slate-800"
                : status === "Sent"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
          }`}
          variant={
            status === "Paid"
              ? "primary"
              : status === "Sent"
                ? "secondary"
                : status === "Overdue"
                  ? "destructive"
                  : "outline"
          }
        >
          {status === "Paid" ? (
            <>
              <CheckCircle className='w-3 h-3 mr-1' />
              {status}
            </>
          ) : (
            <>
              <XCircle className='w-3 h-3 mr-1' />
              {status}
            </>
          )}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
];
