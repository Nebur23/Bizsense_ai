//import { getProductCategories } from "@/actions/inventory/ProductCategory";
import { CategoryTable } from "@/components/inventory/category/CategoriesTable";
import Link from "next/link";

export default async function CategoriesPage() {
 // const categories = await getProductCategories();

  return (
    <div className='p-6 space-y-6 mt-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Product Categories</h1>
        <Link
          href='categories/new'
          className='text-sm text-blue-600 hover:underline'
        >
          + New Category
        </Link>
      </div>

      <CategoryTable />
    </div>
  );
}
