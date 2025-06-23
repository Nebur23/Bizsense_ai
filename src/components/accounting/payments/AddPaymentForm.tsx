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
import { format } from "date-fns";
import {
  applyPaymentToInvoice,
  getInvoicesForCustomer,
} from "@/actions/accounting/invoices";
import {
  createPayment,
  findMatchingInvoices,
} from "@/actions/accounting/payments";
import { getMobileMoneyAccounts } from "../mobile-money.actions";
import { getCustomers } from "@/actions/accounting/customers";
import { getSuppliers } from "@/actions/accounting/suppliers";
import { Textarea } from "@/components/ui/textarea";

// Validation Schema
const paymentSchema = z.object({
  paymentType: z.string().min(1, "Payment type is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  invoiceId: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  accountId: z.string(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
  onSuccess?: () => void;
}

export function AddPaymentForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [mobileMoneyAccounts, setMobileMoneyAccounts] = useState<any[]>([]);
  const [matchingInvoices, setMatchingInvoices] = useState<any[]>([]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "Receipt",
      paymentMethod: "MOBILE_MONEY",
      amount: 0,
      reference: "",
      notes: "",
    },
  });

  const paymentType = form.watch("paymentType");
  const customerId = form.watch("customerId");
  // Watch for changes in payment method
  const paymentMethod = form.watch("paymentMethod");
  const amount = form.watch("amount");

  // Load customers and suppliers
  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, suppRes] = await Promise.all([
          getCustomers(),
          getSuppliers(),
        ]);
        setCustomers(custRes);
        setSuppliers(suppRes);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load customers/suppliers");
      }
    }

    loadData();
  }, []);

  // Load invoices when customer changes
  useEffect(() => {
    if (paymentType === "Receipt" && customerId) {
      async function loadCustomerInvoices(id: string) {
        try {
          const res = await getInvoicesForCustomer(id);
          setInvoices(res);
        } catch (error) {
          console.error("Error loading invoices:", error);
          toast.error("Failed to load customer invoices");
        }
      }

      loadCustomerInvoices(customerId);
    } else {
      setInvoices([]);
    }
  }, [paymentType, customerId]);

  useEffect(() => {
    async function loadMobileMoneyAccounts() {
      if (paymentMethod === "MOBILE_MONEY") {
        try {
          const res = await getMobileMoneyAccounts();
          setMobileMoneyAccounts(res);
        } catch (error) {
          console.error("Failed to load mobile money accounts:", error);
          toast.error("Could not load mobile money accounts");
        }
      }
    }

    loadMobileMoneyAccounts();
  }, [paymentMethod]);

  useEffect(() => {
    if (paymentType === "Receipt" && customerId && amount > 0) {
      async function loadMatches() {
        const matches = await findMatchingInvoices(
          customerId as string,
          amount
        );
        setMatchingInvoices(matches);
      }

      loadMatches();
    }
  }, [customerId, amount, paymentType]);

  async function onSubmit(values: PaymentFormData) {
    setLoading(true);
    try {
      const res = await createPayment(values);
      if (!res.success)
        throw new Error(res.message || "Payment creation failed");

      if (values.invoiceId) {
        await applyPaymentToInvoice(values.invoiceId, values.amount);
      }

      toast.success(res.message || "Payment recorded successfully");
      form.reset({
        paymentType: "Receipt",
        paymentMethod: "MOBILE_MONEY",
        amount: 0,
        reference: "",
        notes: "",
        customerId: "",
        invoiceId: "",
      });
      onSuccess?.();
      // router.push("/accounting/payments");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while recording the payment."
      );
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

        {/* Mobile Money Account Selector (if applicable) */}

        {paymentMethod === "MOBILE_MONEY" && (
          <FormField
            control={form.control}
            name='accountId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Mobile Money Account</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select account' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mobileMoneyAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountName} ({acc.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* Customer or Supplier */}
        {paymentType === "Receipt" ? (
          <FormField
            control={form.control}
            name='customerId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={value => {
                    field.onChange(value);
                  }}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select customer' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map(cust => (
                      <SelectItem key={cust.id} value={cust.id}>
                        {cust.name} - {cust.customerCode}
                      </SelectItem>
                    ))}
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
                    {suppliers.map(supp => (
                      <SelectItem key={supp.id} value={supp.id}>
                        {supp.supplierName} - {supp.supplierCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Invoice Selector (only for receipts) */}
        {paymentType === "Receipt" && (
          <FormField
            control={form.control}
            name='invoiceId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Invoice</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select invoice' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {invoices.length > 0 ? (
                      invoices.map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - Due:
                          {format(new Date(inv.dueDate), "PPP")} - Balance:{" "}
                          {formatCurrency(inv.balance)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value='none'>
                        No unpaid invoices
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Amount */}
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (XAF)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min='0.01'
                  step='0.01'
                  {...field}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    form.setValue(`amount`, val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {matchingInvoices.length > 0 && (
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Suggested Invoices</p>
            {matchingInvoices.map(inv => (
              <Button
                key={inv.id}
                variant='outline'
                className='w-full justify-between'
                onClick={() => {
                  form.setValue("invoiceId", inv.id);
                  form.setValue("amount", inv.balance);
                }}
              >
                <span>{inv.invoiceNumber}</span>
                <span className='text-muted-foreground'>
                  {formatCurrency(inv.balance)}
                </span>
              </Button>
            ))}
          </div>
        )}

        {/* Reference / Transaction ID */}
        <FormField
          control={form.control}
          name='reference'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference / Transaction ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type='submit' disabled={loading}>
          {loading ? "Recording..." : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}
