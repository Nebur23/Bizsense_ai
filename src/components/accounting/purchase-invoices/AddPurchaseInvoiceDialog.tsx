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
import { AddPurchaseInvoiceForm } from "./AddPurchaseInvoiceForm";
import { useState } from "react";

export function AddPurchaseInvoiceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New Purchase Invoice</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-5xl w-full h-[90vh] overflow-auto '>
          <DialogHeader>
            <DialogTitle>Create Purchase Invoice</DialogTitle>
            <DialogDescription>Select supplier and add items</DialogDescription>
          </DialogHeader>

          <AddPurchaseInvoiceForm onSuccess={() => setOpen(false)} />

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
