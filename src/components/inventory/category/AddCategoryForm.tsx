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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  createProductCategory,
  getProductCategories,
} from "@/actions/inventory/ProductCategory";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTaxTypes } from "@/actions/accounting/taxes";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
  defaultTaxTypeId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  onSuccess?: () => void;
}

export function AddCategoryForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [taxTypes, setTaxTypes] = useState<
    { id: string; name: string; rate: number }[]
  >([]);

  // Load  tax types
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, taxRes] = await Promise.all([
          getProductCategories(),
          getTaxTypes(),
        ]);
        setTaxTypes(taxRes);
        setParentCategories(catsRes);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load data");
      }
    }

    loadData();
  }, []);

  // Load existing categories for parent selection
  // useEffect(() => {
  //   async function loadCategories() {
  //     try {
  //       const res = await getProductCategories();
  //       setParentCategories(res);
  //     } catch (error) {
  //       console.error("Failed to load categories:", error);
  //       toast.error("Failed to load categories");
  //     }
  //   }

  //   loadCategories();
  // }, []);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: "",
      isActive: true,
    },
  });

  async function onSubmit(values: CategoryFormData) {
    setLoading(true);
    try {
      const res = await createProductCategory(values);
      if (!res.success)
        throw new Error(res.message || "Failed to save category");

      toast.success("Category created successfully");
      onSuccess?.();
      router.push("");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while creating the category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Basic Info */}

        <CardAction>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., Electronics' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name='defaultTaxTypeId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={value => {
                      const selectedTax = taxTypes.find(t => t.id === value);
                      if (selectedTax) {
                        form.setValue(`defaultTaxTypeId`, selectedTax.id);
                      }
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
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
          </CardContent>
        </CardAction>

        {/* Parent Category */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Category</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Optional: Select a main category if this is a subcategory.
            </p>

            <FormField
              control={form.control}
              name='parentId'
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select parent category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <FormLabel htmlFor='isActive'>Active</FormLabel>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        id='isActive'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex justify-end pt-6'>
          <Button type='submit' disabled={loading} className='w-full md:w-auto'>
            {loading ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
