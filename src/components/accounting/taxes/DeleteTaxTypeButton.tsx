"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useState } from "react";
import { deleteTaxType } from "@/actions/accounting/taxes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  taxTypeId: string;
  taxName: string;
  onSuccess?: () => void;
}

export function DeleteTaxTypeButton({ taxTypeId, taxName, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        setOpen(false);
        const res = await deleteTaxType(taxTypeId);
        if (res.success === false) {
          toast.error(res.message);
          return;
        }
        onSuccess?.();
        router.refresh();
      } catch (error) {
        console.error("Failed to delete tax type:", error);
        alert("An error occurred while deleting the tax type.");
      }
    });
  };

  return (
    <>
      <Button variant='destructive' size='sm' onClick={() => setOpen(true)}>
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md w-full'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tax type{" "}
              <strong>{taxName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
