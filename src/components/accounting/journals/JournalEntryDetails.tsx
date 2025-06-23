import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import React from "react";

interface Props {
  entry: {
    id: string;
    number: string;
    date: string;
    description: string;
    status: "Draft" | "Posted" | "Reversed";
    businessId: string;
    debit: number;
    credit: number;
    lines: Array<{
      accountId: string;
      accountName: string;
      accountCode: string;
      accountType: string;
      debitAmount: number;
      creditAmount: number;
      description?: string;
      reference?: string;
    }>;
  };
}

export function JournalEntryDetails({ entry }: Props) {
  const isBalanced = entry.debit === entry.credit;

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Journal Entry Details</CardTitle>
          <Badge
            variant={
              entry.status === "Posted"
                ? "default"
                : entry.status === "Draft"
                  ? "secondary"
                  : "destructive"
            }
          >
            {entry.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm'>
          <div>
            <p className='text-muted-foreground'>Entry Number</p>
            <p className='font-medium'>{entry.number}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Date</p>
            <p className='font-medium'>{format(new Date(entry.date), "PPP")}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Total Debit / Credit</p>
            <p className='font-medium'>
              {isBalanced ? (
                <span className='text-green-600'>Balanced</span>
              ) : (
                <span className='text-red-600'>Unbalanced</span>
              )}
            </p>
          </div>
        </div>

        <p className='mb-6'>
          <strong>Description:</strong>{" "}
          {entry.description || "No description provided"}
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className='text-right'>Debit (XAF)</TableHead>
              <TableHead className='text-right'>Credit (XAF)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell>
                  {line.accountName} ({line.accountCode})
                </TableCell>
                <TableCell>{line.description || "-"}</TableCell>
                <TableCell className='text-right'>
                  {line.debitAmount.toLocaleString()} XAF
                </TableCell>
                <TableCell className='text-right'>
                  {line.creditAmount.toLocaleString()} XAF
                </TableCell>
              </TableRow>
            ))}

            <TableRow className='font-medium border-t'>
              <TableCell colSpan={2} className='text-right'>
                Totals
              </TableCell>
              <TableCell className='text-right'>
                {entry.debit.toLocaleString()} XAF
              </TableCell>
              <TableCell className='text-right'>
                {entry.credit.toLocaleString()} XAF
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
