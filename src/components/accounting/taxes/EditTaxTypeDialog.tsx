/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditTaxTypeForm } from "./EditTaxTypeForm";
import { useState } from "react";

interface Props {
  taxId: string;
  defaultValues: any;
  onSuccess?: () => void;
}

export function EditTaxTypeDialog({ taxId, defaultValues, onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md w-full'>
          <DialogHeader>
            <DialogTitle>Edit Tax Type</DialogTitle>
            <DialogDescription>Update tax type details</DialogDescription>
          </DialogHeader>

          <EditTaxTypeForm
            taxId={taxId}
            defaultValues={defaultValues}
            onSuccess={() => {
              onSuccess?.();
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
