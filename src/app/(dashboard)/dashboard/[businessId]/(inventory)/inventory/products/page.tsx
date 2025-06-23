import Link from "next/link";
//import { getProducts } from "@/actions/inventory/Products";
import ProductTable from "@/components/inventory/products/productTable";

export default async function ProductsPage() {
 // const products = await getProducts();

  return (
    <div className='p-6 space-y-6 mt-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Product Catalog</h1>
        <Link
          href='products/new'
          className='text-sm text-blue-600 hover:underline'
        >
          + Add New Product
        </Link>
      </div>

      <ProductTable />

      {/* <ProductDataTable /> */}
    </div>
  );
}
