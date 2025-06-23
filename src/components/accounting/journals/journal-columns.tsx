"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { EditJournalEntryDialog } from "./EditJournalEntryDialog";
import {
  JournalEntry,
  JournalEntryUpdateInput,
} from "@/actions/accounting/journalEntry";
//import { EditJournalEntryDialog } from "./EditJournalEntryDialog";

export const columns: ColumnDef<JournalEntry>[] = [
  {
    accessorKey: "number",
    header: "Entry #",
    meta: {
      filterVariant: "text",
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/${row.original.businessId}/Finance/accounting/journal/${row.original.id}`}
          className='font-medium hover:underline'
        >
          {row.getValue("number")}
        </Link>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    meta: {
      filterVariant: "date",
    },
    cell: ({ row }) => format(new Date(row.getValue("date")), "PPP"),
  },
  {
    accessorKey: "description",
    header: "Description",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "debit",
    header: "Debit",
    meta: {
      filterVariant: "range",
    },
    cell: ({ row }) => {
      return formatCurrency(row.getValue("debit"));
    },
  },
  {
    accessorKey: "credit",
    header: "Credit",
    meta: {
      filterVariant: "range",
    },
    cell: ({ row }) => {
      return formatCurrency(row.getValue("credit"));
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "Posted"
              ? "default"
              : status === "Draft"
                ? "secondary"
                : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entry = row.original;
      const entryUpdate: JournalEntryUpdateInput = {
        transactionDate: new Date(entry.date),
        description: entry.description,
        lines: entry.lines.map(line => ({
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description,
          reference: line.reference, // Uncomment if reference is needed
        })),
      };
      return (
        <div className='flex gap-2 justify-end'>
          <EditJournalEntryDialog
            entryNumber={entry.number}
            entry={entryUpdate}
            entryId={entry.id}
          />
        </div>
      );
    },
  },
];
