import {
  getProductWithVariants,
} from "@/actions/inventory/Products";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductWithVariants(id);

  if (!product) return null;

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>{product.name}</h1>
        <Link
          href={`/inventory/products/${id}/edit`}
          className='text-sm text-blue-600 hover:underline'
        >
          Edit Product
        </Link>
      </div>

      {/* Basic Info */}
      <Card className='p-6'>
        <h2 className='font-semibold mb-4'>Basic Information</h2>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-muted-foreground'>SKU</p>
            <p>{product.productCode}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Description</p>
            <p>{product.description || "-"}</p>
          </div>
        </div>
      </Card>

      {/* Inventory Info */}
      {product.trackInventory && (
        <Card className='p-6'>
          <h2 className='font-semibold mb-4'>Inventory Details</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Stock Quantity</p>
              <p>{product.stockQuantity}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Reorder Level</p>
              <p>{product.reorderLevel}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Related Invoices */}
      <Card className='p-6'>
        <h2 className='font-semibold mb-4'>Sales History</h2>
        <ul className='space-y-1'>
          {product.invoiceItems.length > 0 ? (
            product.invoiceItems.map(item => (
              <li key={item.id} className='text-sm'>
                Sold in invoice #{item.invoiceId}, quantity: {item.quantity}
              </li>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>
              No sales history yet
            </p>
          )}
        </ul>
      </Card>
    </div>
  );
}
