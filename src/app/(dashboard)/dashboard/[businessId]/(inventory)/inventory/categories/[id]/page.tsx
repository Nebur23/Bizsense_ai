import { getProductCategory } from "@/actions/inventory/ProductCategory";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getProductCategory(id);

  if (!category) return null;

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>
          Category: {category.categoryName}
        </h1>
        <Link
          href={`/inventory/categories/${id}/edit`}
          className='text-sm text-blue-600 hover:underline'
        >
          Edit Category
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Basic Info */}
        <Card className='p-6'>
          <Badge variant='secondary' className='font-semibold mb-4'>
            Basic Information
          </Badge>
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Name</p>
              <p className='font-medium'>{category.categoryName}</p>
            </div>

            <div>
              <p className='text-sm text-muted-foreground'>Description</p>
              <p className='font-medium'>{category.description || "-"}</p>
            </div>
          </div>
        </Card>

        {/* Parent Info */}
        {category.parentCategory && (
          <Card className='p-6'>
            <Badge variant='secondary' className='font-semibold mb-4'>
              Parent Category
            </Badge>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Category</p>
                <p className='font-medium'>
                  {category.parentCategory.categoryName}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Subcategories */}
        {category.subCategories.length > 0 && (
          <Card className='p-6'>
            <Badge variant='secondary' className='font-semibold mb-4'>
              Subcategories
            </Badge>
            <ul className='list-disc ml-5 space-y-1'>
              {category.subCategories.map(sub => (
                <li key={sub.id} className='text-sm'>
                  {sub.categoryName}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Products in Category */}
        {category.products.length > 0 && (
          <Card className='p-6'>
            <Badge variant='secondary' className='font-semibold mb-4'>
              Products in This Category
            </Badge>
            <ul className='space-y-2'>
              {category.products.map(prod => (
                <li key={prod.id} className='text-sm'>
                  {prod.name} – {formatCurrency(prod.sellingPrice as number)}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
