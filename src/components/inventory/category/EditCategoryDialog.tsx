import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditCategoryForm } from "./EditCategoryForm";
import { Edit } from "lucide-react";

interface Props {
  categoryId: string;
}

export function EditCategoryDialog({ categoryId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setOpen(true)}>
        <Edit className='w-4 h-4 text-green-600' />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden'>
          <DialogHeader>
            <DialogTitle>Edit Product Category</DialogTitle>
            <DialogDescription>
              Review and update products categories
            </DialogDescription>
          </DialogHeader>

          <EditCategoryForm
            categoryId={categoryId}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
