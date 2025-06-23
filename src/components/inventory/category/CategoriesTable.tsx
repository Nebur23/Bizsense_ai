import { DataTable } from "@/components/ui/data-table";
import { getProductCategories } from "@/actions/inventory/ProductCategory";
import { columns } from "./category-columns";

export async function CategoryTable() {
  const data = await getProductCategories();

  return (
    <div className='space-y-6'>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
