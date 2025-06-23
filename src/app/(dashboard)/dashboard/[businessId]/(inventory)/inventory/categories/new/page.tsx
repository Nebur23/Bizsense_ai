import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddCategoryForm } from "@/components/inventory/category/AddCategoryForm";

export default async function AddCategoryPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return (
    <div className='p-6 space-y-6 mt-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Add Product Category</h1>
        <Link
          href={`/dashboard/${businessId}/inventory/categories`}
          className='text-sm text-blue-600 hover:underline flex justify-center items-center'
        >
          <ArrowLeft className='w-3 h-3' /> Categories
        </Link>
      </div>

      <AddCategoryForm />
    </div>
  );
}
