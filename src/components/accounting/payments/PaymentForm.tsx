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
import { useState } from "react";
import { MobileMoneyDialog } from "./MobileMoneyDialog";
import { createPayment } from "@/actions/accounting/payments";
import { Textarea } from "@/components/ui/textarea";

const paymentSchema = z.object({
  paymentType: z.string().min(1, "Payment type is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  invoiceId: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const [loading, setLoading] = useState(false);
  const [showMobileMoney, setShowMobileMoney] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "Receipt",
      paymentMethod: "MOBILE_MONEY",
    },
  });

  async function onSubmit(values: PaymentFormData) {
    setLoading(true);
    try {
      await createPayment(values);
      alert("Payment recorded successfully!");
      form.reset();
    } catch (error) {
      console.error(error);
      alert("Failed to record payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='paymentType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Receipt'>Receipt</SelectItem>
                    <SelectItem value='Payment'>Payment</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='paymentMethod'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  onValueChange={value => {
                    field.onChange(value);
                    if (value === "MOBILE_MONEY") {
                      setShowMobileMoney(true);
                    }
                  }}
                  defaultValue={field.value}
                >
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
        </div>

        {form.watch("paymentType") === "Receipt" && (
          <FormField
            control={form.control}
            name='customerId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select customer' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Replace with dynamic data */}
                    <SelectItem value='customer-1'>John Doe</SelectItem>
                    <SelectItem value='customer-2'>Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("paymentType") === "Payment" && (
          <FormField
            control={form.control}
            name='supplierId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select supplier' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Replace with dynamic data */}
                    <SelectItem value='supplier-1'>
                      Shoe Supplier Ltd
                    </SelectItem>
                    <SelectItem value='supplier-2'>
                      Fabric Distributors
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={loading}>
          {loading ? "Recording..." : "Record Payment"}
        </Button>

        {/* Mobile Money Dialog */}
        <MobileMoneyDialog
          open={showMobileMoney}
          onOpenChange={setShowMobileMoney}
        />
      </form>
    </Form>
  );
}
