/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { getSuppliers } from "@/actions/accounting/suppliers";
import { createPurchaseInvoice } from "@/actions/accounting/purchase-invoice";
import { Textarea } from "@/components/ui/textarea";
import { getProducts } from "@/actions/inventory/Products";

const purchaseInvoiceSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().min(0.01, "Quantity must be valid"),
        unitCost: z.number().min(0.01, "Unit cost must be valid"),
        taxRate: z.number(),
        taxAmount: z.number(),
        lineTotal: z.number(),
      })
    )
    .nonempty("At least one item is required"),
});

export type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;

interface Props {
  onSuccess?: () => void;
}

export function AddPurchaseInvoiceForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Load products and suppliers
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, suppRes] = await Promise.all([
          getProducts(),
          getSuppliers(),
        ]);
        setProducts(prodRes);
        setSuppliers(suppRes);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load products/suppliers");
      }
    }

    loadData();
  }, []);

  const form = useForm<PurchaseInvoiceFormData>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      supplierId: "",
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: "",
          quantity: 1,
          unitCost: 0,
          taxRate: 0,
          taxAmount: 0,
          lineTotal: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const subtotal =
    watchItems?.reduce((sum, item) => sum + item.quantity * item.unitCost, 0) ||
    0;
  const taxAmount =
    watchItems?.reduce(
      (sum, item) => sum + (item.quantity * item.unitCost * item.taxRate) / 100,
      0
    ) || 0;

  const totalAmount = subtotal + taxAmount;

  // Auto-fill line totals as user types
  useEffect(() => {
    watchItems.forEach((item, index) => {
      const taxRate = item.taxRate || 0;
      const lineSubtotal = item.quantity * item.unitCost;
      const lineTax = (lineSubtotal * taxRate) / 100;
      const lineTotal = lineSubtotal + lineTax;

      form.setValue(`items.${index}.taxAmount`, lineTax);
      form.setValue(`items.${index}.lineTotal`, lineTotal);
    });
  }, [watchItems, form]);

  async function onSubmit(values: PurchaseInvoiceFormData) {
    setLoading(true);
    try {
      const res = await createPurchaseInvoice(values);
      if (!res.success)
        throw new Error(res.message || "Failed to save invoice");

      toast.success(res.message || "Purchase invoice created successfully");
      onSuccess?.();
      router.push("/accounting/purchase-invoices");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while creating the purchase invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Supplier */}
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
                      {supp.supplierName} ({supp.supplierCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Invoice Date */}
        <FormField
          control={form.control}
          name='invoiceDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Date</FormLabel>
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

        {/* Due Date */}
        <FormField
          control={form.control}
          name='dueDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
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

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Line Items */}
        <h3 className='font-medium'>Invoice Items</h3>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='grid grid-cols-6 gap-4 border p-4 rounded-md space-y-2'
            >
              {/* Product */}
              <FormField
                control={form.control}
                name={`items.${index}.productId`}
                render={({ field }) => (
                  <FormItem className='col-span-3'>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select product' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(prod => (
                          <SelectItem key={prod.id} value={prod.id}>
                            {prod.name} ({formatCurrency(prod.price)} XAF)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className='col-span-1'>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.01'
                        {...field}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue(`items.${index}.quantity`, val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Cost */}
              <FormField
                control={form.control}
                name={`items.${index}.unitCost`}
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Unit Cost (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.01'
                        {...field}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue(`items.${index}.unitCost`, val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Rate */}
              <FormField
                control={form.control}
                name={`items.${index}.taxRate`}
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Tax (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        max='100'
                        step='0.01'
                        {...field}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue(`items.${index}.taxRate`, val);
                        }}
                      />
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
                  Remove Item
                </Button>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <div className='flex justify-end pt-4'>
            <Button
              type='button'
              variant='ghost'
              onClick={() =>
                append({
                  productId: "",
                  quantity: 1,
                  unitCost: 0,
                  taxRate: 0,
                  taxAmount: 0,
                  lineTotal: 0,
                })
              }
            >
              + Add Item
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className='border-t pt-4 text-sm space-y-1'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)} XAF</span>
          </div>
          <div className='flex justify-between'>
            <span>Tax</span>
            <span>{formatCurrency(taxAmount)} XAF</span>
          </div>
          <div className='flex justify-between font-bold'>
            <span>Total Amount</span>
            <span>{formatCurrency(totalAmount)} XAF</span>
          </div>
        </div>

        {/* Submit */}
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={loading}>
            {loading ? "Creating..." : "Create Purchase Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
