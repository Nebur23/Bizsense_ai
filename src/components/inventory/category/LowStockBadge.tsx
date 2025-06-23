import { Badge } from "@/components/ui/badge";

interface Props {
  stockQuantity: number | null;
  reorderLevel: number | null;
  trackInventory: boolean;
}

export function LowStockBadge({
  stockQuantity,
  reorderLevel,
  trackInventory,
}: Props) {
  if (!stockQuantity) return null;
  if (!trackInventory) return null;
  if (reorderLevel === null) return null;
  if (stockQuantity <= reorderLevel) {
    return (
      <Badge variant='destructive' className='ml-2'>
        Low Stock
      </Badge>
    );
  }

  return (
    <Badge variant='outline' className='ml-2'>
      In Stock
    </Badge>
  );
}
