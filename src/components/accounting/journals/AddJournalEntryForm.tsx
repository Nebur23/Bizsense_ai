"use client";

import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { createJournalEntry } from "@/actions/accounting/journalEntry";
import { ChartOfAccounts } from "@prisma/client";
import { getChartOfAccountFull } from "@/actions/accounting/chartOfAccounts";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const journalEntrySchema = z.object({
  transactionDate: z.coerce.date(),
  description: z.string().optional(),
  lines: z
    .array(
      z.object({
        accountId: z.string().min(1, "Account is required"),
        debitAmount: z.number().min(0),
        creditAmount: z.number().min(0),
        description: z.string().optional(),
      })
    )
    .nonempty("At least one line item is required"),
});

export type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface Props {
  onSuccess?: () => void;
}

export function AddJournalEntryForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<ChartOfAccounts[]>([]);

  useEffect(() => {
    async function loadAccountTypes() {
      try {
        const types = await getChartOfAccountFull();
        setAccount(types);
      } catch (error) {
        console.error("Failed to load account types:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccountTypes();
  }, []);

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      transactionDate: new Date(),
      lines: [
        { accountId: "", debitAmount: 0, creditAmount: 0, description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const totalDebit =
    form.watch("lines")?.reduce((sum, line) => sum + line.debitAmount, 0) || 0;
  const totalCredit =
    form.watch("lines")?.reduce((sum, line) => sum + line.creditAmount, 0) || 0;

  async function onSubmit(values: JournalEntryFormData) {
    const allZeroLines = values.lines.every(
      line => line.debitAmount === 0 && line.creditAmount === 0
    );

    if (allZeroLines) {
      toast.warning("All lines have zero amounts. Are you sure?");
    }

    setLoading(true);
    try {
      const res = await createJournalEntry(values);
      if (res.success === false) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Failed to create journal entry:", error);
      toast.error("An error occurred while creating the journal entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Transaction Date */}
        <FormField
          control={form.control}
          name='transactionDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Date</FormLabel>
              <FormControl>
                <Input
                  type='date'
                  value={field.value.toISOString().split("T")[0]}
                  onChange={e => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Entry Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className='font-medium'>Journal Lines</h3>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='grid grid-cols-6 gap-5 border p-4 rounded-md'
            >
              {/* Account */}
              <FormField
                control={form.control}
                name={`lines.${index}.accountId`}
                render={({ field }) => (
                  <FormItem className='col-span-4'>
                    <FormLabel>Account</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select account' />
                      </SelectTrigger>
                      <SelectContent>
                        {account.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.accountName} ({acc.accountCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Debit */}
              <FormField
                control={form.control}
                name={`lines.${index}.debitAmount`}
                render={({ field }) => (
                  <FormItem className='col-span-3'>
                    <FormLabel>Debit</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={field.value}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue(`lines.${index}.debitAmount`, val);
                          if (val > 0)
                            form.setValue(`lines.${index}.creditAmount`, 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Credit */}
              <FormField
                control={form.control}
                name={`lines.${index}.creditAmount`}
                render={({ field }) => (
                  <FormItem className='col-span-3'>
                    <FormLabel>Credit</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={field.value}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue(`lines.${index}.creditAmount`, val);
                          if (val > 0)
                            form.setValue(`lines.${index}.debitAmount`, 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Line Description */}
              <FormField
                control={form.control}
                name={`lines.${index}.description`}
                render={({ field }) => (
                  <FormItem className='col-span-6'>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder='E.g. Cash deposit' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remove Button */}
              <div className='col-span-6 flex justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  onClick={() => remove(index)}
                >
                  Remove Line
                </Button>
              </div>
            </div>
          ))}

          {/* Add Line Button */}
          <div className='flex justify-end'>
            <Button
              type='button'
              variant='ghost'
              onClick={() =>
                append({
                  accountId: "",
                  debitAmount: 0,
                  creditAmount: 0,
                  description: "",
                })
              }
            >
              + Add Line
            </Button>
          </div>
        </div>

        {/* Totals */}
        <div className='flex justify-between text-sm font-medium pt-2'>
          <span>
            Total Debit:
            {formatCurrency(totalDebit)}
          </span>
          <span>
            Total Credit:
            {formatCurrency(totalCredit)}
          </span>
        </div>

        {!isBalanced(totalDebit, totalCredit) && (
          <p className='text-red-500'>⚠️ Debits and Credits must balance</p>
        )}

        {/* Submit */}
        <div className='flex justify-end pt-4'>
          <Button
            type='submit'
            //disabled={!isBalanced(totalDebit, totalCredit) || loading}
          >
            {loading ? "Creating..." : "Create Journal Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function isBalanced(debit: number, credit: number): boolean {
  return Math.abs(debit - credit) < 0.01;
}
