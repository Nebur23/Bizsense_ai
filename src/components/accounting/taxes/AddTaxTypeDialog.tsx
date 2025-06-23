"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddTaxTypeForm } from "./AddTaxTypeForm";
import { useState } from "react";

export function AddTaxTypeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Add New Tax Type</Button>
        </DialogTrigger>
        <DialogContent className='max-w-md w-full'>
          <DialogHeader>
            <DialogTitle>Add New Tax Type</DialogTitle>
            <DialogDescription>
              Create a new tax type (e.g., VAT, Withholding)
            </DialogDescription>
          </DialogHeader>

          <AddTaxTypeForm
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
