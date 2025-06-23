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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getProducts } from "@/actions/inventory/Products";
import { recordPhysicalCount } from "@/actions/inventory/physical-count";

const physicalCountSchema = z.object({
  countDate: z.date(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        expectedQuantity: z.number().min(0),
        actualQuantity: z.number().min(0),
        variance: z.number(),
      })
    )
    .nonempty("At least one item is required"),
});

export type PhysicalCountFormData = z.infer<typeof physicalCountSchema>;

export function PhysicalCountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Load all products
  useEffect(() => {
    async function loadProducts() {
      const res = await getProducts();
      setProducts(res);
    }
    loadProducts();
  }, []);

  const form = useForm<PhysicalCountFormData>({
    resolver: zodResolver(physicalCountSchema),
    defaultValues: {
      countDate: new Date(),
      items: products.map(p => ({
        productId: p.id,
        expectedQuantity: p.stockQuantity || 0,
        actualQuantity: p.stockQuantity || 0,
        variance: 0,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: PhysicalCountFormData) {
    setLoading(true);
    try {
      const res = await recordPhysicalCount(values);
      if (!res.success) throw new Error(res.message || "Failed to save count");

      toast.success("Physical count recorded");
      router.push("/inventory/physical-count");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while recording physical count.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Count Date */}
        <FormField
          control={form.control}
          name='countDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
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

        {/* Items */}
        <h3 className='font-medium'>Verify Stock Levels</h3>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='grid grid-cols-6 gap-4 border p-4 rounded-md'
            >
              {/* Product Name */}
              <div className='col-span-3 flex items-center'>
                <p>{products[index]?.name}</p>
              </div>

              {/* Expected */}
              <div className='col-span-1 flex items-center'>
                <p className='text-right'>
                  {form.getValues(`items.${index}.expectedQuantity`)}
                </p>
              </div>

              {/* Actual */}
              <FormField
                control={form.control}
                name={`items.${index}.actualQuantity`}
                render={({ field }) => (
                  <FormItem className='col-span-1'>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        step='1'
                        {...field}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          const expected = form.getValues(
                            `items.${index}.expectedQuantity`
                          );
                          const variance = val - expected;
                          form.setValue(`items.${index}.variance`, variance);
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variance */}
              <div className='col-span-1 flex items-center'>
                <p
                  className={`font-medium ${
                    form.getValues(`items.${index}.variance`) > 0
                      ? "text-green-600"
                      : form.getValues(`items.${index}.variance`) < 0
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {form.getValues(`items.${index}.variance`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={loading}>
            {loading ? "Saving..." : "Record Physical Count"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
