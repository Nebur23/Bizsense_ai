import { getProducts } from "@/actions/inventory/Products";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./products-columns";

const ProductTable = async () => {
    const products = await getProducts()
    return ( 
        <DataTable columns={columns} data={products} />
     );
}
 
export default ProductTable;