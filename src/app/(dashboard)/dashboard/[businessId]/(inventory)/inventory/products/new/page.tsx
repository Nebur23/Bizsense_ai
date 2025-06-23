
import AddProductForm from "@/components/inventory/products/AddProductForm";


export default function NewProductPage() {
  return (
    <div className='p-6 space-y-6 mt-10'>
      <h1 className='text-2xl font-bold'>Add New Product</h1>
      <AddProductForm />
    </div>
  );
}
