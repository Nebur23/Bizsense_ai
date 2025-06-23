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
//import { AddInvoiceForm } from "./AddInvoiceForm";
import { useState } from "react";

export function AddInvoiceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>+ New Invoice</Button>
        </DialogTrigger>
        <DialogContent className='w-[1000px] max-h-[90vh] overflow-y-auto overflow-x-hidden'>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Select customer and add items</DialogDescription>
          </DialogHeader>

          {/* <AddInvoiceForm onSuccess={() => setOpen(false)} /> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
