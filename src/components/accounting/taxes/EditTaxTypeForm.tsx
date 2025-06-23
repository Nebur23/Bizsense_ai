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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateTaxType } from "@/actions/accounting/taxes";
import { toast } from "sonner";

// Validation Schema
const taxTypeSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  code: z.string().min(1, "Tax code is required"),
  rate: z
    .number()
    .min(0, "Rate must be at least 0")
    .max(100, "Rate cannot exceed 100"),
  authority: z.string().optional(),
});

export type TaxTypeFormData = z.infer<typeof taxTypeSchema>;

interface Props {
  taxId: string;
  defaultValues: TaxTypeFormData;
  onSuccess?: () => void;
}

export function EditTaxTypeForm({ taxId, defaultValues, onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<TaxTypeFormData>({
    resolver: zodResolver(taxTypeSchema),
    defaultValues: defaultValues || {
      name: "",
      code: "",
      rate: 0,
      authority: "MINFI",
    },
  });

  async function onSubmit(values: TaxTypeFormData) {
    setLoading(true);
    try {
      const res = await updateTaxType(taxId, values);
      if (res.success === false) {
        toast.error(res.message);
        return;
      }
      onSuccess?.();
      router.refresh(); // Refresh page to reflect changes
    } catch (error) {
      console.error("Failed to update tax type:", error);
      toast.error("An error occurred while updating the tax type.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {/* Tax Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Name</FormLabel>
              <FormControl>
                <Input placeholder='e.g., VAT Standard Rate' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tax Code */}
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Code</FormLabel>
              <FormControl>
                <Input placeholder='e.g., VAT19' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tax Rate */}
        <FormField
          control={form.control}
          name='rate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min='0'
                  max='100'
                  step='0.01'
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Authority */}
        <FormField
          control={form.control}
          name='authority'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Authority</FormLabel>
              <FormControl>
                <Input placeholder='e.g., MINFI' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => onSuccess?.()} type='button'>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? "Updating..." : "Update Tax Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
