/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
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
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { getInvoicesForCustomer } from "@/actions/accounting/invoices";
import { applyBulkPayment } from "@/actions/accounting/payments";

const bulkPaymentSchema = z.object({
  paymentType: z.string().min(1, "Payment type is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  payments: z
    .array(
      z.object({
        invoiceId: z.string().min(1, "Invoice ID is required"),
        amount: z.number().min(0.01, "Amount must be valid"),
        paymentDate: z.date(),
      })
    )
    .nonempty("At least one payment must be applied"),
});

export type BulkPaymentFormData = z.infer<typeof bulkPaymentSchema>;

interface Props {
  customerId?: string;
  onSuccess?: () => void;
}

export function BulkPaymentForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);

  const form = useForm<BulkPaymentFormData>({
    resolver: zodResolver(bulkPaymentSchema),
    defaultValues: {
      paymentType: "Receipt",
      paymentMethod: "MOBILE_MONEY",
      payments: [],
    },
  });

  const paymentType = form.watch("paymentType");
  const selectedCustomerId = form.watch("customerId");

  // Load customer's unpaid invoices
  useEffect(() => {
    async function loadInvoices() {
      if (!selectedCustomerId) return;
      try {
        const invoices = await getInvoicesForCustomer(selectedCustomerId);
        setCustomerInvoices(invoices);
      } catch (error) {
        console.error("Failed to load invoices:", error);
        toast.error("Failed to load customer invoices");
      }
    }

    loadInvoices();
  }, [selectedCustomerId]);

  // Watch for changes in payment lines
  const watchPayments = form.watch("payments");
  const totalPayment =
    watchPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  async function onSubmit(values: BulkPaymentFormData) {
    setLoading(true);
    try {
      const res = await applyBulkPayment(values);
      if (!res.success)
        throw new Error(res.message || "Failed to apply payments");

      toast.success("Payments applied successfully");
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while applying payments.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Payment Type */}
        <FormField
          control={form.control}
          name='paymentType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='Receipt'>Customer Receipt</SelectItem>
                  <SelectItem value='Payment'>Supplier Payment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method */}
        <FormField
          control={form.control}
          name='paymentMethod'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select method' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='CASH'>Cash</SelectItem>
                  <SelectItem value='BANK'>Bank Transfer</SelectItem>
                  <SelectItem value='MOBILE_MONEY'>Mobile Money</SelectItem>
                  <SelectItem value='CHECK'>Check</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer or Supplier */}
        {paymentType === "Receipt" ? (
          <FormField
            control={form.control}
            name='customerId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select customer' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Replace with dynamic data */}
                    <SelectItem value='cust-1'>John Doe</SelectItem>
                    <SelectItem value='cust-2'>Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name='supplierId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select supplier' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='supp-1'>Shoe Supplier Ltd</SelectItem>
                    <SelectItem value='supp-2'>Fabric Distributors</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Payment Lines */}
        <h3 className='font-medium'>Apply Payments to Invoices</h3>
        <div className='space-y-4'>
          {customerInvoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className='grid grid-cols-5 gap-4 border p-4 rounded-md'
            >
              {/* Invoice Number */}
              <div className='col-span-2 flex items-center'>
                <span className='text-sm'>{invoice.invoiceNumber}</span>
              </div>

              {/* Due Date */}
              <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>

              {/* Amount */}
              <div className='col-span-1 flex items-end'>
                <FormField
                  control={form.control}
                  name={`payments.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type='number'
                          min='0.01'
                          step='0.01'
                          placeholder='Enter amount'
                          {...field}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hidden Fields */}
              <input
                type='hidden'
                {...form.register(`payments.${index}.invoiceId`)}
                value={invoice.id}
              />
              <input
                type='hidden'
                {...form.register(`payments.${index}.paymentDate`)}
                value={new Date().toISOString()}
              />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className='flex justify-end pt-4'>
          <div className='w-full max-w-sm space-y-1'>
            <div className='flex justify-between'>
              <span>Total Applied:</span>
              <span className='font-bold'>
                {formatCurrency(totalPayment)} XAF
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Remaining Balance:</span>
              <span className='text-muted-foreground'>
                {formatCurrency(
                  customerInvoices.reduce((sum, inv) => sum + inv.balance, 0) -
                    totalPayment
                )}{" "}
                XAF
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={loading || totalPayment <= 0}>
            {loading ? "Applying..." : "Apply Payments"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
