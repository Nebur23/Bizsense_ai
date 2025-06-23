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
import { createTaxType } from "@/actions/accounting/taxes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const taxTypeSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  code: z.string().min(1, "Tax code is required"),
  rate: z
    .number()
    .min(0, "Rate must be at least 0")
    .max(100, "Rate cannot exceed 100"),
  authority: z.string().optional(),
});

interface AddATaxFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export type TaxTypeFormData = z.infer<typeof taxTypeSchema>;

export function AddTaxTypeForm({ onSuccess, onCancel }: AddATaxFormProps) {
  const router = useRouter();
  const form = useForm<TaxTypeFormData>({
    resolver: zodResolver(taxTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      rate: 0,
      authority: "MINFI",
    },
  });

  const onSubmit = async (values: TaxTypeFormData) => {
    try {
      const res = await createTaxType(values);
      if (res.success === false) {
        toast.error(res.message);
        return;
      }
      form.reset();
      toast.success(res.message);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={onCancel} type='button'>
            Cancel
          </Button>
          <Button disabled={form.formState.isLoading} type='submit'>
            {form.formState.isLoading ? "Saving..." : "Save Tax Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
