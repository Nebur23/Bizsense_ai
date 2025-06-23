/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/actions/accounting/invoices";
import { ShoppingCart, Trash, User } from "lucide-react";

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().min(0.01, "Quantity must be valid"),
        taxTypeId: z.string().optional(),
        taxRate: z.number(),
        sellingPrice: z.number().min(0.01, "Unit price must be valid"),
        taxAmount: z.number(),
        lineTotal: z.number(),
      })
    )
    .nonempty("At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Props {
  customers: Array<{ id: string; name: string; customerCode: string }>;
  products: Array<{
    id: string;
    image: string | null;
    productCode: string;
    name: string;
    productType: string;
    description: string | null;
    category: {
      id: string;
      businessId: string;
      isActive: boolean;
      isDeleted: boolean;
      createdAt: Date;
      description: string | null;
      defaultTaxTypeId: string | null;
      categoryName: string;
      parentCategoryId: string | null;
    } | null;
    stockQuantity: number;
    trackInventory: boolean;
    unitOfMeasure: string | null;
    pricing: string;
    sellingPrice: number | null;
    costPrice: number | null;
    isActive: boolean;
    reorderLevel: number | null;
    businessId: string;
    defaultTaxId: string | null;
  }>;
  taxTypes: Array<{ id: string; name: string; rate: number }>;
  onSuccess?: () => void;
}

export function AddInvoiceForm({
  customers,
  products,
  taxTypes,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: "",
          quantity: 1,
          sellingPrice: 0,
          taxTypeId: "",
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

  // Calculate totals
  const subtotal =
    watchItems?.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.sellingPrice || 0),
      0
    ) || 0;

  const totalTax =
    watchItems?.reduce((sum, item) => sum + (item.taxAmount || 0), 0) || 0;

  const totalAmount = subtotal + totalTax;

  // Handle product selection and auto-fill product details
  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);

    if (selectedProduct) {
      const price = selectedProduct.sellingPrice || 0;
      let taxRate = 0;
      let taxTypeId = "";

      // Set default tax if available
      if (selectedProduct.defaultTaxId) {
        const defaultTax = taxTypes.find(
          t => t.id === selectedProduct.defaultTaxId
        );
        if (defaultTax) {
          taxRate = defaultTax.rate;
          taxTypeId = defaultTax.id;
        }
      }

      // Update form values
      form.setValue(`items.${index}.sellingPrice`, price);
      form.setValue(`items.${index}.taxRate`, taxRate);
      form.setValue(`items.${index}.taxTypeId`, taxTypeId);

      // Calculate initial line totals
      const quantity = form.getValues(`items.${index}.quantity`) || 1;
      const lineSubtotal = quantity * price;
      const lineTax = (lineSubtotal * taxRate) / 100;
      const lineTotal = lineSubtotal + lineTax;

      form.setValue(`items.${index}.taxAmount`, lineTax);
      form.setValue(`items.${index}.lineTotal`, lineTotal);
    }
  };

  // Recalculate line totals when quantity changes
  const handleQuantityChange = (index: number, quantity: number) => {
    const currentItem = watchItems[index];
    if (currentItem && currentItem.sellingPrice) {
      const lineSubtotal = quantity * currentItem.sellingPrice;
      const lineTax = (lineSubtotal * (currentItem.taxRate || 0)) / 100;
      const lineTotal = lineSubtotal + lineTax;

      form.setValue(`items.${index}.taxAmount`, lineTax);
      form.setValue(`items.${index}.lineTotal`, lineTotal);
    }
  };

  // Handle tax type change
  const handleTaxTypeChange = (index: number, taxTypeId: string) => {
    const selectedTax = taxTypes.find(t => t.id === taxTypeId);
    if (selectedTax) {
      form.setValue(`items.${index}.taxRate`, selectedTax.rate);

      // Recalculate line totals
      const currentItem = watchItems[index];
      if (currentItem) {
        const lineSubtotal =
          (currentItem.quantity || 0) * (currentItem.sellingPrice || 0);
        const lineTax = (lineSubtotal * selectedTax.rate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        form.setValue(`items.${index}.taxAmount`, lineTax);
        form.setValue(`items.${index}.lineTotal`, lineTotal);
      }
    }
  };

  async function onSubmit(values: InvoiceFormData) {
    setIsSubmitting(true);
    try {
      const res = await createInvoice(values);
      if (!res.success) {
        throw new Error(res.message || "Failed to save invoice");
      }

      toast.success(res.message || "Invoice created successfully");
      onSuccess?.();
      //router.push("/accounting/invoices");
      router.refresh();
      form.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "An error occurred while creating the invoice."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6 max-w-6xl'
      >
        {/* Customer Information */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <User className='w-5 h-5 text-green-600' />
            </div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Customer Information
            </h2>
          </div>

          <FormField
            control={form.control}
            name='customerId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select customer' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map(cust => (
                      <SelectItem key={cust.id} value={cust.id}>
                        {cust.name} ({cust.customerCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
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
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
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
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name='notes'
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
        </div>

        {/* Line Items */}
        <div className='space-y-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <ShoppingCart className='w-5 h-5 text-purple-600' />
            </div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Invoice Items
            </h2>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className='grid grid-cols-1 lg:grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr_auto] gap-2 border rounded-lg p-4'
            >
              {/* Product */}
              <FormField
                control={form.control}
                name={`items.${index}.productId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product *</FormLabel>
                    <Select
                      onValueChange={value => {
                        field.onChange(value);
                        handleProductChange(index, value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select product' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='w-full'>
                        {products.map(prod => (
                          <SelectItem key={prod.id} value={prod.id}>
                            {prod.name} –{" "}
                            {formatCurrency(prod.sellingPrice ?? 0)}
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
                  <FormItem>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='1'
                        step='1'
                        value={field.value || ""}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          field.onChange(val);
                          handleQuantityChange(index, val);
                        }}
                        className='min-w-[80px]'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selling Price (Auto-filled) */}
              <FormField
                control={form.control}
                name={`items.${index}.sellingPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        readOnly
                        value={field.value ? formatCurrency(field.value) : ""}
                        className='min-w-[120px]'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Type */}
              <FormField
                control={form.control}
                name={`items.${index}.taxTypeId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Type</FormLabel>
                    <Select
                      onValueChange={value => {
                        field.onChange(value);
                        handleTaxTypeChange(index, value);
                      }}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className='min-w-[120px]'>
                          <SelectValue placeholder='Select tax' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taxTypes.map(tax => (
                          <SelectItem key={tax.id} value={tax.id}>
                            {tax.name} ({tax.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Line Total */}
              <FormField
                control={form.control}
                name={`items.${index}.lineTotal`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        readOnly
                        value={field.value ? formatCurrency(field.value) : ""}
                        className='min-w-[120px]'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remove Item */}
              <div className='flex mt-3 pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <div className='flex justify-end pt-4'>
            <Button
              type='button'
              variant='ghost'
              className='whitespace-nowrap'
              onClick={() =>
                append({
                  productId: "",
                  quantity: 1,
                  sellingPrice: 0,
                  taxTypeId: "",
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

        {/* Summary Section */}
        <div className='border-t pt-4 text-sm space-y-1 bg-gray-50 p-4 rounded-md'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Tax</span>
            <span>{formatCurrency(totalTax)}</span>
          </div>
          <div className='flex justify-between font-bold pt-2'>
            <span>Total Amount</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end pt-6'>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full md:w-auto'
          >
            {isSubmitting ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
