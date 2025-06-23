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
import {
  getProductCategories,
  getProductCategory,
  updateProductCategory,
} from "@/actions/inventory/ProductCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
  businessId: z.string().min(1, "Business ID is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  categoryId: string;
  onSuccess?: () => void;
}

export function EditCategoryForm({ categoryId, onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [parentCategories, setParentCategories] = useState<any[]>([]);

  // Load category data
  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await getProductCategory(categoryId);
        const parentCats = await getProductCategories();

        setCategory(catRes);
        setParentCategories(parentCats);
      } catch (error) {
        console.error("Failed to load category:", error);
        toast.error("Failed to load category");
      }
    }

    loadData();
  }, [categoryId]);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      parentId: "",
      isActive: true,
      businessId: "business-1",
    },
  });

  // Pre-fill form once data is loaded
  useEffect(() => {
    if (category) {
      form.reset({
        categoryName: category.categoryName,
        description: category.description || "",
        parentId: category.parentCategoryId || "",
        isActive: category.isActive ?? true,
        businessId: category.businessId,
      });
    }
  }, [category, form]);

  async function onSubmit(values: CategoryFormData) {
    setLoading(true);
    try {
      const res = await updateProductCategory(categoryId, values);
      if (!res.success)
        throw new Error(res.message || "Failed to update category");

      toast.success("Category updated successfully");
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while updating the category.");
    } finally {
      setLoading(false);
    }
  }

  if (!category) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Category</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='categoryName'
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
              name='parentId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select parent category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentCategories.map(cat => {
                        if (cat.id === categoryId) return null;
                        return (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.categoryName}
                          </SelectItem>
                        );
                      })}
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
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={loading} className='w-full md:w-auto'>
            {loading ? "Updating..." : "Update Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
